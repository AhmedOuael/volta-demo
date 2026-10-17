import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getBrand, serverBrandHref } from "@/lib/brand/server";
import { DEMO_EMAIL } from "@/lib/demo";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  if (await getCurrentUser()) redirect(await serverBrandHref("/admin"));
  const brand = await getBrand();
  const demoPassword = process.env.DEMO_MODE === "true" ? process.env.DEMO_PASSWORD : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="font-display text-3xl font-extrabold text-center mb-2">{brand.name}</p>
        <p className="text-xs tracking-label uppercase text-secondary text-center mb-10">Administration</p>
        {demoPassword && (
          <div className="mb-8 border border-outline-variant bg-surface-container-low p-4 text-sm">
            <p className="font-semibold mb-2">Accès démo, en lecture seule</p>
            <p>
              E-mail : <span className="font-mono select-all">{DEMO_EMAIL}</span>
            </p>
            <p>
              Mot de passe : <span className="font-mono select-all">{demoPassword}</span>
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
