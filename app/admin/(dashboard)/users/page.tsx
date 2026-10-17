import { requireUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/admin/users";
import TeamManager from "./TeamManager";

export default async function UsersPage() {
  const me = await requireUser("ADMIN", { allowDemo: false });
  const users = await listUsers();

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl mb-2">Équipe</h1>
      <p className="text-sm text-secondary mb-8">
        L'équipe traite les commandes. Les administrateurs gèrent aussi l'équipe et les produits.
      </p>
      <TeamManager users={users} currentUserId={me.id.toString()} />
    </div>
  );
}
