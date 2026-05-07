import { NextRequest } from "next/server";
import { withAuth, successResponse } from "@/lib/api-middleware";
import type { Database } from "@/types/database";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export const GET = withAuth(
  async (_req: NextRequest) => {
    const supabaseModule = await import("@/lib/supabase/server");
    const supabase = await supabaseModule.createAdminClient();

    const [usersResult, playersResult, reportsResult, messagesResult] = await Promise.all([
      supabase.from("users").select("id, role, current_plan_slug, subscription_status, created_at"),
      supabase.from("player_profiles").select("id, is_verified, is_visible"),
      supabase.from("scouting_reports").select("id"),
      supabase.from("messages").select("id", { count: "exact", head: true }),
    ]);

    const users = (usersResult.data ?? []) as Pick<UserRow, "id" | "role" | "current_plan_slug" | "subscription_status" | "created_at">[];

    const roleDist = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const planDist = users.reduce((acc, u) => {
      acc[u.current_plan_slug] = (acc[u.current_plan_slug] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeSubscriptions = users.filter((u) => u.subscription_status === "active").length;

    return successResponse({
      total_users: users.length,
      active_subscriptions: activeSubscriptions,
      role_distribution: roleDist,
      plan_distribution: planDist,
      total_player_profiles: playersResult.data?.length ?? 0,
      total_scouting_reports: reportsResult.data?.length ?? 0,
      total_messages: messagesResult.count ?? 0,
    });
  },
  { roles: ["admin"] }
);
