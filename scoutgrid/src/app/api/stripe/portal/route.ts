import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

export const POST = withAuth(async (_req: NextRequest, { user, authUser }) => {
  const { getOrCreateStripeCustomer, getStripe } = await import("@/lib/stripe");
  const customerId = await getOrCreateStripeCustomer(user.id, authUser.email ?? "");

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
});
