import { NextRequest, NextResponse } from "next/server";
import { withAuth, successResponse, errorResponse } from "@/lib/api-middleware";
import { z } from "zod";

const ReportSchema = z.object({
  player_profile_id: z.string().uuid().optional().nullable(),
  coach_profile_id: z.string().uuid().optional().nullable(),
  report_date: z.string(),
  technical_rating: z.number().int().min(1).max(10),
  physical_rating: z.number().int().min(1).max(10),
  mental_rating: z.number().int().min(1).max(10),
  overall_rating: z.number().int().min(1).max(10),
  strengths: z.string().max(2000).optional().nullable(),
  weaknesses: z.string().max(2000).optional().nullable(),
  summary: z.string().max(5000).optional().nullable(),
  recommendation: z.enum(["sign", "monitor", "reject", "loan"]),
  is_private: z.boolean().default(true),
});

export const POST = withAuth(
  async (req: NextRequest, { user }) => {
    const body = await req.json();
    const parsed = ReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
    }

    if (!parsed.data.player_profile_id && !parsed.data.coach_profile_id) {
      return NextResponse.json({ error: "Either player_profile_id or coach_profile_id is required" }, { status: 400 });
    }

    const supabaseModule = await import("@/lib/supabase/server");
    const supabase = await supabaseModule.createClient();

    const { data, error } = await supabase
      .from("scouting_reports")
      .insert({ scout_id: user.id, ...parsed.data })
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
  },
  { roles: ["scout", "agent", "club", "admin"], requireSubscription: true }
);

export const GET = withAuth(
  async (req: NextRequest, { user }) => {
    const { searchParams } = req.nextUrl;
    const playerId = searchParams.get("player_id");
    const coachId = searchParams.get("coach_id");

    const supabaseModule = await import("@/lib/supabase/server");
    const supabase = await supabaseModule.createClient();

    let query = supabase
      .from("scouting_reports")
      .select("*, player_profiles(full_name, position, current_club)")
      .eq("scout_id", user.id)
      .order("report_date", { ascending: false });

    if (playerId) query = query.eq("player_profile_id", playerId);
    if (coachId) query = query.eq("coach_profile_id", coachId);

    const { data, error } = await query;
    if (error) return errorResponse(error.message);
    return successResponse(data);
  },
  { roles: ["scout", "agent", "club", "admin"] }
);
