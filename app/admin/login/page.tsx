import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { serverBrandHref } from "@/lib/brand/server";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  if (await getCurrentUser()) redirect(await serverBrandHref("/admin"));

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="font-display text-4xl tracking-tighter text-center mb-2">NOIR</p>
        <p className="text-xs tracking-label uppercase text-secondary text-center mb-10">Admin</p>
        <LoginForm />
      </div>
    </div>
  );
}
