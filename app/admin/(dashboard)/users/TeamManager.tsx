"use client";

import { useState, useTransition } from "react";
import type { UserRow } from "@/lib/admin/users";
import { createUserAction, resetPasswordAction, setUserActiveAction } from "./actions";

const inputClass =
  "w-full bg-transparent border border-outline-variant px-3 py-2.5 text-sm focus:outline-none focus:border-primary";

export default function TeamManager({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "STAFF", password: "" });

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string, after?: () => void) => {
    setMessage(null);
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        setMessage({ ok: true, text: success });
        after?.();
      } else {
        setMessage({ ok: false, text: result.error ?? "Une erreur s'est produite." });
      }
    });
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => createUserAction(form), `Compte créé pour ${form.email}.`, () =>
      setForm({ name: "", email: "", role: "STAFF", password: "" })
    );
  };

  const resetPassword = (user: UserRow) => {
    const password = window.prompt(`Nouveau mot de passe pour ${user.email} (10 caractères minimum) :`);
    if (!password) return;
    run(() => resetPasswordAction(user.id, password), `Mot de passe modifié pour ${user.email}. La personne a été déconnectée.`);
  };

  const toggleActive = (user: UserRow) => {
    if (user.active && !window.confirm(`Désactiver ${user.email} ? La personne sera déconnectée immédiatement.`)) return;
    run(() => setUserActiveAction(user.id, !user.active), user.active ? "Compte désactivé." : "Compte réactivé.");
  };

  return (
    <div className="space-y-10">
      {message && <p className={`text-sm ${message.ok ? "text-accent" : "text-error"}`}>{message.text}</p>}

      <div className="border border-outline-variant divide-y divide-outline-variant">
        {users.map((u) => (
          <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div className={u.active ? "" : "opacity-50"}>
              <div className="text-sm font-medium">
                {u.name || "—"} <span className="ml-2 text-[10px] tracking-label uppercase text-secondary">{u.role === "ADMIN" ? "Administrateur" : u.role === "DEMO" ? "Démo" : "Équipe"}</span>
                {!u.active && <span className="ml-2 text-[10px] tracking-label uppercase text-error">Désactivé</span>}
              </div>
              <div className="text-xs text-secondary">{u.email}</div>
            </div>
            {u.id === currentUserId ? (
              <span className="text-xs text-secondary">Vous</span>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => resetPassword(u)} disabled={pending} className="px-3 py-2 border border-outline-variant text-[11px] tracking-label uppercase hover:border-primary disabled:opacity-40">
                  Réinitialiser le mot de passe
                </button>
                <button
                  onClick={() => toggleActive(u)}
                  disabled={pending}
                  className={`px-3 py-2 border text-[11px] tracking-label uppercase disabled:opacity-40 ${u.active ? "border-error text-error" : "border-outline-variant hover:border-primary"}`}
                >
                  {u.active ? "Désactiver" : "Réactiver"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={create} className="border border-outline-variant p-5 space-y-4">
        <h2 className="text-[11px] font-semibold tracking-label uppercase text-secondary">Ajouter un membre</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-secondary block mb-1">Nom</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} />
          </label>
          <label className="block">
            <span className="text-xs text-secondary block mb-1">E-mail</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={inputClass} />
          </label>
          <label className="block">
            <span className="text-xs text-secondary block mb-1">Rôle</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
              <option value="STAFF">Équipe (commandes uniquement)</option>
              <option value="ADMIN">Administrateur (tout)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-secondary block mb-1">Mot de passe provisoire (10 caractères minimum)</span>
            <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={10} autoComplete="new-password" className={inputClass} />
          </label>
        </div>
        <button type="submit" disabled={pending} className="px-5 py-2.5 bg-primary text-on-primary text-xs font-medium tracking-label uppercase disabled:opacity-40">
          Créer le compte
        </button>
      </form>
    </div>
  );
}
