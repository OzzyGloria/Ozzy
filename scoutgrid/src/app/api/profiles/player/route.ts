import { NextRequest, NextResponse } from "next/server";
import { withAuth, successResponse, errorResponse } from "@/lib/api-middleware";
import { z } from "zod";

const PlayerProfileSchema = z.object({
  full_name: z.string().min(2).max(100),
  date_of_birth: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  second_nationality: z.string().optional().nullable(),
  height_cm: z.number().int().min(100).max(230).optional().nullable(),
  weight_kg: z.number().int().min(40).max(160).optional().nullable(),
  preferred_foot: z.enum(["Left", "Right", "Both"]).optional().nullable(),
  weak_foot_rating: z.number().int().min(1).max(5).optional().nullable(),
  position: z.string().optional().nullable(),
  secondary_position: z.string().optional().nullable(),
  current_club: z.string().max(100).optional().nullable(),
  league: z.string().max(100).optional().nullable(),
  contract_until: z.number().int().optional().nullable(),
  agent_name: z.string().max(100).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  availability_status: z.enum(["available", "not_available", "loan_only"]).optional(),
  is_visible: z.boolean().optional(),
});

export const POST = withAuth(
  async (req: NextRequest, { user }) => {
    if (user.role !== "player") {
      return errorResponse("Only players can create player profiles", 403);
    }

    const body = await req.json();
    const parsed = PlayerProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const supabaseModule = await import("@/lib/supabase/server");
    const supabase = await supabaseModule.createClient();

    const { data, error } = await supabase
      .from("player_profiles")
      .upsert(
        { user_id: user.id, ...parsed.data },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) return errorResponse(error.message);

    // Recalculate completeness
    if (data.id) {
      const { data: pct } = await supabase
        .rpc("calculate_player_completeness", { p_profile_id: data.id });
      if (pct !== null) {
        await supabase
          .from("player_profiles")
          .update({ profile_completeness: pct })
          .eq("id", data.id);
      }
    }

    return successResponse(data, 201);
  }
);

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  const { data, error } = await supabase
    .from("player_profiles")
    .select("*, player_stats(*), highlights(*), market_valuations(*)")
    .eq("user_id", user.id)
    .single();

  if (error) return errorResponse(error.message, 404);
  return successResponse(data);
});
