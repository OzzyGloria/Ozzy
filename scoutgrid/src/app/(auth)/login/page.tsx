import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = {
  title: "Sign In — ScoutGrid",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
