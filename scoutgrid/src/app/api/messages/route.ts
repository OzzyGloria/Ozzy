import { NextRequest } from "next/server";
import { withAuth, successResponse, errorResponse } from "@/lib/api-middleware";

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  const [sentResult, receivedResult] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  // Mark received as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  return successResponse({ sent: sentResult.data || [], received: receivedResult.data || [] });
});
