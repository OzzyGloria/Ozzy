import { NextRequest, NextResponse } from "next/server";
import { withAuth, successResponse, errorResponse } from "@/lib/api-middleware";

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return errorResponse(error.message);
  return successResponse(data);
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
  if (!["scout_pro", "club_elite"].includes(user.current_plan_slug)) {
    return NextResponse.json({ error: "Scout Pro required for saved searches" }, { status: 402 });
  }

  const body = await req.json();
  const { name, filters, alert_enabled } = body;

  if (!name || !filters) {
    return NextResponse.json({ error: "name and filters are required" }, { status: 400 });
  }

  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  const { data, error } = await supabase
    .from("saved_searches")
    .insert({ user_id: user.id, name, filters, alert_enabled: alert_enabled ?? false })
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return successResponse(data, 201);
});

export const DELETE = withAuth(async (req: NextRequest, { user }) => {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return errorResponse(error.message);
  return successResponse({ deleted: true });
});
