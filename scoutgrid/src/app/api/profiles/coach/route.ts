import { NextRequest, NextResponse } from "next/server";
import { withAuth, successResponse, errorResponse } from "@/lib/api-middleware";
import { z } from "zod";

const CoachProfileSchema = z.object({
  full_name: z.string().min(2).max(100),
  date_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  current_club: z.string().max(100).optional().nullable(),
  current_role: z.string().max(100).optional().nullable(),
  preferred_formation: z.string().max(20).optional().nullable(),
  playing_style: z.array(z.string()).optional().nullable(),
  licenses: z.array(z.string()).optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  is_visible: z.boolean().optional(),
});

export const POST = withAuth(
  async (req: NextRequest, { user }) => {
    if (user.role !== "coach") {
      return errorResponse("Only coaches can create coach profiles", 403);
    }

    const body = await req.json();
    const parsed = CoachProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    const supabaseModule = await import("@/lib/supabase/server");
    const supabase = await supabaseModule.createClient();

    const { data, error } = await supabase
      .from("coach_profiles")
      .upsert({ user_id: user.id, ...parsed.data }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
  }
);

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  const { data, error } = await supabase
    .from("coach_profiles")
    .select("*, coach_stats(*), highlights(*)")
    .eq("user_id", user.id)
    .single();

  if (error) return errorResponse(error.message, 404);
  return successResponse(data);
});
