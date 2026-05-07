import { NextRequest, NextResponse } from "next/server";
import { withAuth, successResponse, errorResponse } from "@/lib/api-middleware";
import { z } from "zod";

const MESSAGE_LIMITS: Record<string, number> = {
  free: 0,
  visible: 0,
  pro_athlete: -1,
  scout_basic: 0,
  scout_pro: -1,
  club_elite: -1,
};

const schema = z.object({
  receiver_id: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
  const limit = MESSAGE_LIMITS[user.current_plan_slug] ?? 0;

  if (limit === 0) {
    return NextResponse.json(
      { error: "Your plan does not include messaging. Upgrade to Pro Athlete or Scout Pro." },
      { status: 402 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  if (limit > 0) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= limit) {
      return NextResponse.json(
        { error: `Monthly message limit (${limit}) reached. Upgrade for unlimited messaging.` },
        { status: 402 }
      );
    }
  }

  const { data: receiver } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("id", parsed.data.receiver_id)
    .single();

  if (!receiver) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: parsed.data.receiver_id,
      body: parsed.data.body,
    })
    .select()
    .single();

  if (error) return errorResponse(error.message);

  // Fire-and-forget email notification
  import("@/lib/resend").then(({ sendMessageNotificationEmail }) => {
    sendMessageNotificationEmail(
      receiver.email ?? "",
      receiver.full_name ?? "User",
      user.full_name ?? "Someone",
      parsed.data.body.slice(0, 100)
    ).catch(() => {});
  });

  return successResponse(message, 201);
});
