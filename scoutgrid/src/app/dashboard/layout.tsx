import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, role, full_name, email, current_plan_slug, is_onboarded")
    .eq("id", user.id)
    .single();

  if (!dbUser) {
    redirect("/login");
  }

  if (!dbUser.is_onboarded) {
    redirect("/onboarding/1");
  }

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      <Sidebar
        role={dbUser.role}
        planSlug={dbUser.current_plan_slug}
        userName={dbUser.full_name}
        userEmail={dbUser.email}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
