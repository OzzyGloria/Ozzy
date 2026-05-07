import { NextRequest, NextResponse } from "next/server";
import { withAuth, successResponse, errorResponse } from "@/lib/api-middleware";
import type { Database } from "@/types/database";

type PlayerUpdate = Database["public"]["Tables"]["player_profiles"]["Update"];
type CoachUpdate = Database["public"]["Tables"]["coach_profiles"]["Update"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export const POST = withAuth(
  async (req: NextRequest) => {
    const body = await req.json();
    const { user_id, profile_type } = body;

    if (!user_id || !profile_type) {
      return NextResponse.json({ error: "user_id and profile_type required" }, { status: 400 });
    }

    const supabaseModule = await import("@/lib/supabase/server");
    const supabase = await supabaseModule.createAdminClient();

    if (profile_type === "player") {
      await supabase
        .from("player_profiles")
        .update({ is_verified: true } satisfies PlayerUpdate)
        .eq("user_id", user_id);
    } else {
      await supabase
        .from("coach_profiles")
        .update({ is_verified: true } satisfies CoachUpdate)
        .eq("user_id", user_id);
    }

    await supabase
      .from("users")
      .update({ is_verified: true } satisfies UserUpdate)
      .eq("id", user_id);

    return successResponse({ verified: true, user_id, profile_type });
  },
  { roles: ["admin"] }
);
