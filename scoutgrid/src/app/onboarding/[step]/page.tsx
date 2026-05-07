import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingStep } from "@/components/forms/OnboardingWizard";

interface OnboardingPageProps {
  params: Promise<{ step: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { step } = await params;
  const stepNum = parseInt(step, 10);

  if (isNaN(stepNum) || stepNum < 1 || stepNum > 6) {
    redirect("/onboarding/1");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, role, full_name, email, current_plan_slug, is_onboarded")
    .eq("id", user.id)
    .single();

  if (!dbUser) redirect("/login");
  if (dbUser.is_onboarded) redirect("/dashboard/player");

  return <OnboardingStep step={stepNum} user={dbUser} />;
}
