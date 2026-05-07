"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSubscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const upgrade = async (planSlug: string, billingPeriod: "monthly" | "annual" = "monthly") => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_slug: planSlug, billing_period: billingPeriod }),
      });

      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error("Failed to create checkout");

      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error("Failed to open portal");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Could not open billing portal.");
    } finally {
      setLoading(false);
    }
  };

  return { upgrade, openPortal, loading };
}
