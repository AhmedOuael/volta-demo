import Link from "@/components/brand/BrandLink";
import { requireUser } from "@/lib/auth/session";
import { listClients } from "@/lib/admin/customers";
import { formatDateTime, formatDZD, formatPhone } from "@/lib/format";
import { getBrand } from "@/lib/brand/server";

type SearchParams = Promise<{ q?: string; page?: string }>;

function href(params: { q?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const s = sp.toString();
  return `/admin/clients${s ? `?${s}` : ""}`;
}

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, pageCount } = await listClients({ storeSlug: (await getBrand()).slug, q, page });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl">Clients</h1>
          <p className="text-sm text-secondary mt-1">Toutes les personnes ayant passé commande, les plus récentes d'abord.</p>
        </div>
        <form action="/admin/clients" className="flex gap-2 w-full md:w-auto">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom ou téléphone"
            className="flex-1 md:w-72 bg-transparent border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button className="px-4 py-2 bg-primary text-on-primary text-xs font-medium tracking-label uppercase">Rechercher</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="text-secondary py-24 text-center">{q ? `Aucun client ne correspond à « ${q} ».` : "Aucun client pour l'instant. Ils apparaissent ici après leur première commande."}</p>
      ) : (
        <>
          <div className="hidden md:block border border-outline-variant overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-left text-[11px] tracking-label uppercase text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Wilaya</th>
                  <th className="px-4 py-3 font-medium text-right">Commandes</th>
                  <th className="px-4 py-3 font-medium text-right">Livrées</th>
                  <th className="px-4 py-3 font-medium text-right">Refusées / retournées</th>
                  <th className="px-4 py-3 font-medium text-right">Dépensé</th>
                  <th className="px-4 py-3 font-medium">Dernière commande</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const cell = (content: React.ReactNode, className = "", first = false) => (
                    <td className="p-0">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        tabIndex={first ? undefined : -1}
                        aria-hidden={first ? undefined : true}
                        className={`block px-4 py-3 ${className}`}
                      >
                        {content}
                      </Link>
                    </td>
                  );
                  return (
                    <tr key={c.id} className="border-t border-outline-variant hover:bg-surface-container-low">
                      {cell(
                        <>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-secondary text-xs">{formatPhone(c.phone)}</div>
                        </>,
                        "",
                        true
                      )}
                      {cell(c.wilaya)}
                      {cell(c.orders, "text-right")}
                      {cell(c.delivered, "text-right")}
                      {cell(c.refusedOrReturned, `text-right ${c.refusedOrReturned > 0 ? "text-error font-semibold" : ""}`)}
                      {cell(formatDZD(c.spent), "text-right whitespace-nowrap")}
                      {cell(c.lastOrderAt ? formatDateTime(c.lastOrderAt) : "—", "text-secondary whitespace-nowrap")}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {rows.map((c) => (
              <Link key={c.id} href={`/admin/clients/${c.id}`} className="block border border-outline-variant p-4">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm whitespace-nowrap">{formatDZD(c.spent)}</span>
                </div>
                <div className="text-sm text-secondary">{formatPhone(c.phone)} · {c.wilaya}</div>
                <div className="text-xs mt-2">
                  {c.orders} commande{c.orders <= 1 ? "" : "s"} · {c.delivered} livrée{c.delivered <= 1 ? "" : "s"}
                  {c.refusedOrReturned > 0 && <span className="text-error font-semibold"> · {c.refusedOrReturned} refusée(s)/retournée(s)</span>}
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 text-sm">
            <span className="text-secondary">{total} clients</span>
            <div className="flex items-center gap-4">
              {page > 1 && <Link href={href({ q, page: page - 1 })} className="hover:underline">Précédent</Link>}
              <span className="text-secondary">Page {page} / {pageCount}</span>
              {page < pageCount && <Link href={href({ q, page: page + 1 })} className="hover:underline">Suivant</Link>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
