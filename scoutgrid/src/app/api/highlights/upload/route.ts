import { NextRequest, NextResponse } from "next/server";
import { withAuth, successResponse, errorResponse } from "@/lib/api-middleware";
import type { Database } from "@/types/database";

type HighlightInsert = Database["public"]["Tables"]["highlights"]["Insert"];

const HIGHLIGHT_LIMITS: Record<string, number> = {
  free: 0,
  visible: 2,
  pro_athlete: 10,
  scout_basic: 0,
  scout_pro: 0,
  club_elite: 0,
};

export const POST = withAuth(async (req: NextRequest, { user }) => {
  const maxHighlights = HIGHLIGHT_LIMITS[user.current_plan_slug] ?? 0;

  if (maxHighlights === 0) {
    return NextResponse.json(
      { error: "Your plan does not support highlight uploads. Upgrade to Visible or Pro Athlete." },
      { status: 402 }
    );
  }

  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  const { count } = await supabase
    .from("highlights")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if ((count ?? 0) >= maxHighlights) {
    return NextResponse.json(
      { error: `Highlight limit reached (${maxHighlights}). Upgrade to upload more.` },
      { status: 402 }
    );
  }

  const { generateUploadSignature } = await import("@/lib/cloudinary");
  const folder = `highlights/${user.id}`;
  const result = await generateUploadSignature(folder);
  const { signature, timestamp, apiKey, cloudName } = result;

  return successResponse({ signature, timestamp, api_key: apiKey, cloud_name: cloudName, folder });
});

export const PUT = withAuth(async (req: NextRequest, { user }) => {
  const body = await req.json();
  const { cloudinary_public_id, cloudinary_url, thumbnail_url, duration_seconds, title } = body;

  if (!cloudinary_public_id || !cloudinary_url) {
    return NextResponse.json({ error: "cloudinary_public_id and cloudinary_url required" }, { status: 400 });
  }

  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  const { count } = await supabase
    .from("highlights")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const ownerType: HighlightInsert["owner_type"] =
    ["scout", "agent", "club", "admin"].includes(user.role) ? "coach" : (user.role as "player" | "coach");

  const { data, error } = await supabase
    .from("highlights")
    .insert({
      owner_id: user.id,
      owner_type: ownerType,
      title: title || "Highlight",
      cloudinary_public_id,
      cloudinary_url,
      thumbnail_url: thumbnail_url ?? null,
      duration_seconds: duration_seconds ?? null,
      sort_order: count ?? 0,
      is_primary: (count ?? 0) === 0,
    } satisfies HighlightInsert)
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return successResponse(data, 201);
});
