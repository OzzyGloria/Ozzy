import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function planSlugFromSubscription(sub: Stripe.Subscription): string {
  return (sub.metadata?.plan_slug as string) || "scout_basic";
}

export async function POST(req: NextRequest) {
  const rawBody = await req.arrayBuffer();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const { getStripe } = await import("@/lib/stripe");
  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = await createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const planSlug = session.metadata?.plan_slug;

      if (!userId || !planSlug) break;

      await supabase.from("users").update({
        subscription_status: "active",
        current_plan_slug: planSlug,
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
      }).eq("id", userId);

      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;

      const planSlug = planSlugFromSubscription(sub);
      const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

      await supabase.from("users").update({
        subscription_status: sub.status === "active" ? "active" : "past_due",
        current_plan_slug: sub.status === "active" ? planSlug : "free",
        subscription_period_end: periodEnd,
      }).eq("id", userId);

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;

      await supabase.from("users").update({
        subscription_status: "cancelled",
        current_plan_slug: "free",
        stripe_subscription_id: null,
      }).eq("id", userId);

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase.from("users").update({
        subscription_status: "past_due",
      }).eq("stripe_customer_id", customerId);

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
