import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata = {
  title: "Create Account — ScoutGrid",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
