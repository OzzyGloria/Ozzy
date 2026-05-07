import { NextRequest, NextResponse } from "next/server";
import { withAuth, errorResponse } from "@/lib/api-middleware";

export const POST = withAuth(async (req: NextRequest, { user, authUser }) => {
  const body = await req.json();
  const { plan_slug, billing_period = "monthly" } = body;

  if (!plan_slug) {
    return NextResponse.json({ error: "plan_slug required" }, { status: 400 });
  }

  const supabaseModule = await import("@/lib/supabase/server");
  const supabase = await supabaseModule.createClient();

  const { data: plan } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("slug", plan_slug)
    .eq("is_active", true)
    .single();

  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const priceId = billing_period === "annual"
    ? plan.stripe_price_id_annual
    : plan.stripe_price_id_monthly;

  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 404 });
  }

  const { getOrCreateStripeCustomer, getStripe } = await import("@/lib/stripe");
  const customerId = await getOrCreateStripeCustomer(user.id, authUser.email ?? "");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&plan=${plan_slug}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { user_id: user.id, plan_slug },
    subscription_data: {
      metadata: { user_id: user.id, plan_slug },
    },
  });

  return NextResponse.json({ url: session.url });
});
