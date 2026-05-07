import { NextRequest } from "next/server";
import { withAuth, successResponse, errorResponse } from "@/lib/api-middleware";

export const GET = withAuth(
  async (req: NextRequest, { user }) => {
    const profileId = req.nextUrl.pathname.split("/").at(-2);
    if (!profileId) return errorResponse("profileId required", 400);

    const supabaseModule = await import("@/lib/supabase/server");
    const supabase = await supabaseModule.createClient();

    const { data, error } = await supabase
      .from("scouting_reports")
      .select("*")
      .eq("player_profile_id", profileId)
      .eq("scout_id", user.id)
      .order("report_date", { ascending: false });

    if (error) return errorResponse(error.message);
    return successResponse(data);
  },
  { roles: ["scout", "agent", "club", "admin"] }
);
