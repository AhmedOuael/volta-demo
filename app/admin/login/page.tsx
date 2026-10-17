import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { serverBrandHref } from "@/lib/brand/server";
import { getBrand } from "@/lib/brand/server";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  if (await getCurrentUser()) redirect(await serverBrandHref("/admin"));
  const brand = await getBrand();

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="font-display text-3xl font-extrabold text-center mb-2">{brand.name}</p>
        <p className="text-xs tracking-label uppercase text-secondary text-center mb-10">Administration</p>
        <LoginForm />
      </div>
    </div>
  );
}
