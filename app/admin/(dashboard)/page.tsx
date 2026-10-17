import Link from "@/components/brand/BrandLink";
import { requireUser } from "@/lib/auth/session";
import { DEFAULT_PERIOD, PERIODS, algiersDate, getOverview, isPeriod, type PeriodKey } from "@/lib/admin/stats";
import { formatDZD } from "@/lib/format";
import { RankedBars, TrendColumns, TrendLine } from "@/components/admin/charts";
import { getBrand } from "@/lib/brand/server";

const card = "border border-outline-variant bg-surface p-5";
const tileLink = `${card} block transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`;
const label = "text-sm text-secondary";
const SCOPE: Record<PeriodKey, string> = {
  today: "aujourd'hui",
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  month: "ce mois-ci",
  "12m": "12 derniers mois",
  all: "depuis le début",
};
const pct = (v: number | null) => (v == null ? "—" : `${Math.round(v * 100)} %`);

function ChartCard({ title, subtitle, children, table }: { title: string; subtitle: string; children: React.ReactNode; table: React.ReactNode }) {
  return (
    <section className={card}>
      <h2 className="font-body text-base font-semibold">{title}</h2>
      <p className="text-xs text-secondary mt-0.5 mb-4">{subtitle}</p>
      {children}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs text-secondary hover:text-primary">Voir en tableau</summary>
        <div className="mt-2 max-h-72 overflow-y-auto">{table}</div>
      </details>
    </section>
  );
}

function DataTable({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs text-secondary">
        <tr>
          <th className="py-1 font-medium">{head[0]}</th>
          <th className="py-1 font-medium text-right">{head[1]}</th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {rows.map(([a, b], i) => (
          <tr key={i} className="border-t border-outline-variant">
            <td className="py-1.5">{a}</td>
            <td className="py-1.5 text-right">{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await requireUser("ADMIN"); // revenue is owner-level; staff are sent to Orders
  const sp = await searchParams;
  const period: PeriodKey = isPeriod(sp.period) ? sp.period : DEFAULT_PERIOD;
  const o = await getOverview(period, (await getBrand()).slug);
  const today = algiersDate(new Date());
  const scope = SCOPE[period];
  const bucketWord = o.bucket === "day" ? "par jour" : "par mois";
  const splitTotal = o.split.home + o.split.stopDesk;
  const homeShare = splitTotal ? o.split.home / splitTotal : 0;

  return (
    <div className="max-w-7xl">
      <h1 className="font-display text-3xl mb-6">Vue d'ensemble</h1>

      {/* One filter row; it scopes everything below except tiles marked "right now" */}
      <nav aria-label="Période" className="flex flex-wrap gap-2 mb-8">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={p.key === DEFAULT_PERIOD ? "/admin" : `/admin?period=${p.key}`}
            aria-current={p.key === period ? "page" : undefined}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              p.key === period ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      {/* Headline numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Link href="/admin/orders?status=DELIVERED" className={`${tileLink} sm:col-span-2`}>
          <p className={label}>Chiffre d'affaires, {scope}</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight">{formatDZD(o.revenue.amount)}</p>
          <p className="mt-3 text-sm text-secondary">
            Sur {o.revenue.delivered} commande{o.revenue.delivered <= 1 ? "" : "s"} livrée{o.revenue.delivered <= 1 ? "" : "s"}
            {o.revenue.delivered > 0 && <> · panier moyen {formatDZD(o.revenue.average)}</>}
          </p>
          <p className="mt-1 text-xs text-secondary">
            Produits uniquement. Frais de livraison encaissés pour le livreur : {formatDZD(o.revenue.deliveryFees)}
          </p>
        </Link>
        <Link href={o.fromDate ? `/admin/orders?from=${o.fromDate}` : "/admin/orders"} className={tileLink}>
          <p className={label}>Commandes, {scope}</p>
          <p className="mt-2 text-3xl font-semibold">{o.orders.period.toLocaleString("fr-FR")}</p>
          <p className="mt-3 text-sm text-secondary">{o.orders.allTime.toLocaleString("fr-FR")} depuis le début</p>
        </Link>
        <Link href={`/admin/orders?from=${today}&to=${today}`} className={tileLink}>
          <p className={label}>Commandes du jour</p>
          <p className="mt-2 text-3xl font-semibold">{o.orders.today.toLocaleString("fr-FR")}</p>
          <p className="mt-3 text-sm text-secondary">Depuis minuit, heure d'Algérie</p>
        </Link>
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Link href="/admin/orders?stage=to-call" className={tileLink}>
          <p className={label}>À appeler, en ce moment</p>
          <p className="mt-2 text-3xl font-semibold">{o.needsCall}</p>
          <p className="mt-3 text-xs text-secondary">Nouvelles, appelées ou injoignables</p>
        </Link>
        <Link href="/admin/orders?stage=on-the-road" className={tileLink}>
          <p className={label}>En route, en ce moment</p>
          <p className="mt-2 text-2xl font-semibold whitespace-nowrap">{formatDZD(o.onTheRoad.amount)}</p>
          <p className="mt-3 text-xs text-secondary">{o.onTheRoad.orders} commande{o.onTheRoad.orders <= 1 ? "" : "s"} en livraison ou au point relais</p>
        </Link>
        <div className={card}>
          <p className={label}>Taux de confirmation</p>
          <p className="mt-2 text-3xl font-semibold">{pct(o.confirmation.rate)}</p>
          <p className="mt-3 text-xs text-secondary">{o.confirmation.confirmed} sur {o.confirmation.decided} commandes appelées confirmées</p>
        </div>
        <div className={card}>
          <p className={label}>Livraisons réussies</p>
          <p className="mt-2 text-3xl font-semibold">{pct(o.delivery.successRate)}</p>
          <p className="mt-3 text-xs text-secondary">
            Taux de retour {pct(o.delivery.returnRate)} ({o.delivery.refusedOrReturned} refusées ou retournées)
          </p>
        </div>
        <div className={card}>
          <p className={label}>Domicile ou point relais</p>
          {splitTotal === 0 ? (
            <p className="mt-2 text-3xl font-semibold">—</p>
          ) : (
            <>
              <div className="mt-4 flex h-2 gap-0.5" aria-hidden="true">
                <div className="rounded-l-full" style={{ width: `${homeShare * 100}%`, background: "#2a78d6" }} />
                <div className="flex-1 rounded-r-full" style={{ background: "#eb6834" }} />
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: "#2a78d6" }} aria-hidden="true" />
                  Domicile <span className="ml-auto font-semibold">{pct(homeShare)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: "#eb6834" }} aria-hidden="true" />
                  Point relais <span className="ml-auto font-semibold">{pct(1 - homeShare)}</span>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Trends: two charts, never one with two scales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Chiffre d'affaires"
          subtitle={`Produits vendus dans les commandes livrées, ${bucketWord}, par date de livraison`}
          table={<DataTable head={["Période", "Chiffre d'affaires"]} rows={o.trend.map((p) => [p.label, formatDZD(p.revenue)])} />}
        >
          <TrendColumns data={o.trend} dataKey="revenue" kind="dzd" unitLabel="Chiffre d'affaires" />
        </ChartCard>
        <ChartCard
          title="Commandes"
          subtitle={`Toutes les commandes passées, ${bucketWord}`}
          table={<DataTable head={["Période", "Commandes"]} rows={o.trend.map((p) => [p.label, String(p.orders)])} />}
        >
          <TrendLine data={o.trend} dataKey="orders" kind="count" unitLabel="Commandes" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Chiffre d'affaires par produit"
          subtitle={`Meilleurs produits des commandes livrées, ${scope}`}
          table={<DataTable head={["Produit", "CA · vendus"]} rows={o.byProduct.map((p) => [p.name, `${formatDZD(p.revenue)} · ${p.units}`])} />}
        >
          {o.byProduct.length ? (
            <RankedBars data={o.byProduct} dataKey="revenue" kind="dzd" unitLabel="Chiffre d'affaires" />
          ) : (
            <p className="py-10 text-center text-sm text-secondary">Aucune commande livrée sur cette période pour l'instant.</p>
          )}
        </ChartCard>
        <ChartCard
          title="Wilayas principales"
          subtitle={`Commandes passées (hors annulées), ${scope}`}
          table={<DataTable head={["Wilaya", "Commandes"]} rows={o.byWilaya.map((w) => [w.name, String(w.orders)])} />}
        >
          {o.byWilaya.length ? (
            <RankedBars data={o.byWilaya} dataKey="orders" kind="count" unitLabel="Commandes" />
          ) : (
            <p className="py-10 text-center text-sm text-secondary">Aucune commande sur cette période pour l'instant.</p>
          )}
        </ChartCard>
      </div>

      {/* Low stock */}
      <section className={card}>
        <h2 className="font-body text-base font-semibold">Stock bas, en ce moment</h2>
        <p className="text-xs text-secondary mt-0.5 mb-4">Variantes en vente avec 3 unités ou moins (après commandes en cours)</p>
        {o.lowStock.length === 0 ? (
          <p className="text-sm text-secondary">Toutes les variantes en vente ont plus de 3 unités.</p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {o.lowStock.map((s, i) => (
              <li key={i}>
                <Link href={`/admin/products/${s.productId}`} className="flex items-center gap-3 py-2.5 hover:bg-surface-container-low -mx-2 px-2">
                  <span className="flex-1 min-w-0 truncate">
                    {s.product} <span className="text-secondary">· {s.variant}</span>
                  </span>
                  <span className={`text-sm font-semibold tabular-nums ${s.available === 0 ? "text-error" : ""}`}>
                    {s.available === 0 ? "Épuisé" : `${s.available} restant${s.available <= 1 ? "" : "s"}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
