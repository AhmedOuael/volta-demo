"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "@/components/brand/BrandLink";
import { useRouter } from "next/navigation";
import { useBrandHref } from "@/components/brand/BrandProvider";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { imageUrl } from "@/lib/images";
import type { CategoryOption, ProductForm as ProductFormData, VariantForm } from "@/lib/admin/products";
import { createCategoryAction, deleteProductAction, saveProductAction } from "./actions";

const input =
  "w-full bg-transparent border border-outline-variant px-3 py-2.5 text-sm focus:outline-none focus:border-primary disabled:opacity-60";
const label = "text-xs text-secondary block mb-1";
const phoneLabel = "md:hidden text-[11px] text-secondary block mb-1";
const section = "border border-outline-variant p-5 md:p-6";
const sectionTitle = "font-body text-[11px] font-semibold tracking-label uppercase text-secondary mb-5";

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const skuFor = (slug: string, v: VariantForm) =>
  [slug, v.color, v.size]
    .filter(Boolean)
    .join("-")
    .toUpperCase()
    .replace(/[^A-Z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

const emptyVariant = (from?: VariantForm): VariantForm => ({
  size: "",
  color: from?.color ?? "",
  sku: "",
  price: from?.price ?? "",
  physicalStock: 0,
  active: true,
});

export default function ProductForm({
  initial,
  categories: initialCategories,
}: {
  initial: ProductFormData;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const brandHref = useBrandHref();
  const isNew = !initial.id;
  const [form, setForm] = useState<ProductFormData>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [detailsText, setDetailsText] = useState(initial.details.join("\n"));
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  const [newImage, setNewImage] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setVariant = (i: number, patch: Partial<VariantForm>) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) }));

  // ---- photos
  // Photos are files in /public (e.g. /catalog/micro-01.jpg); uploads are off in this demo.
  const addImage = () => {
    const path = newImage.trim();
    if (!path.startsWith("/") || form.images.includes(path)) return;
    setForm((f) => ({ ...f, images: [...f.images, path] }));
    setNewImage("");
  };
  const moveImage = (i: number, dir: -1 | 1) =>
    setForm((f) => {
      const images = [...f.images];
      const j = i + dir;
      if (j < 0 || j >= images.length) return f;
      [images[i], images[j]] = [images[j], images[i]];
      return { ...f, images };
    });

  // ---- categories
  const addCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await createCategoryAction(name);
      if (!result.ok || !result.category) return setMessage({ ok: false, text: result.ok ? "Impossible d'ajouter la catégorie." : result.error });
      const cat = result.category;
      setCategories((cs) => (cs.some((c) => c.id === cat.id) ? cs : [...cs, cat].sort((a, b) => a.name.localeCompare(b.name))));
      setForm((f) => ({ ...f, categoryIds: f.categoryIds.includes(cat.id) ? f.categoryIds : [...f.categoryIds, cat.id] }));
      setNewCategory("");
    });
  };

  // ---- save / delete
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const payload: ProductFormData = {
      ...form,
      details: detailsText.split("\n").map((d) => d.trim()).filter(Boolean),
      variants: form.variants.map((v) => ({ ...v, sku: v.sku.trim() || skuFor(form.slug, v) })),
    };
    startTransition(async () => {
      const result = await saveProductAction(form.id ?? null, payload);
      if (!result.ok) return setMessage({ ok: false, text: result.error });
      if (isNew && result.id) {
        router.replace(brandHref(`/admin/products/${result.id}?created=1`));
      } else {
        setMessage({ ok: true, text: "Enregistré. La boutique est à jour." });
        router.refresh();
      }
    });
  };

  const remove = () => {
    if (!form.id || !window.confirm(`Supprimer « ${form.name} » ? Un produit déjà commandé est masqué de la boutique au lieu d'être supprimé.`)) return;
    startTransition(async () => {
      const result = await deleteProductAction(form.id!);
      if (!result.ok) return setMessage({ ok: false, text: result.error });
      router.replace(brandHref(result.archived ? `/admin/products/${form.id}?archived=1` : "/admin/products"));
      router.refresh();
    });
  };

  return (
    <form onSubmit={save} className="max-w-5xl space-y-6 pb-28">
      {/* Basics */}
      <section className={section}>
        <h2 className={sectionTitle}>Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className={label}>Nom</span>
            <input
              className={input}
              value={form.name}
              required
              maxLength={120}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }))}
            />
          </label>
          <label className="block">
            <span className={label}>Adresse de la page</span>
            <div className="flex items-center border border-outline-variant focus-within:border-primary">
              <span className="pl-3 text-sm text-secondary whitespace-nowrap">/products/</span>
              <input
                className="w-full bg-transparent py-2.5 pr-3 text-sm focus:outline-none"
                value={form.slug}
                required
                maxLength={80}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </div>
          </label>
          <label className="block md:col-span-2">
            <span className={label}>Description</span>
            <textarea className={input} rows={4} maxLength={2000} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </label>
          <label className="block md:col-span-2">
            <span className={label}>Caractéristiques, une par ligne (ex. : Capteur 24,2 Mpx)</span>
            <textarea className={input} rows={4} value={detailsText} onChange={(e) => setDetailsText(e.target.value)} />
          </label>
        </div>
      </section>

      {/* Photos */}
      <section className={section}>
        <h2 className={sectionTitle}>Photos</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {form.images.map((img, i) => {
            const src = imageUrl(img);
            return (
              <div key={img} className="group relative">
                <div className="relative aspect-3/4 bg-surface-container overflow-hidden">
                  {src ? (
                    <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-secondary p-2 text-center">Image introuvable</span>
                  )}
                  {i === 0 && <span className="absolute top-1.5 left-1.5 bg-black/75 text-white text-[10px] px-1.5 py-0.5">Principale</span>}
                </div>
                <div className="flex justify-between mt-1">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Déplacer à gauche" className="p-1 disabled:opacity-25">
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" onClick={() => set("images", form.images.filter((x) => x !== img))} aria-label="Retirer la photo" className="p-1 text-error">
                    <X size={16} />
                  </button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label="Déplacer à droite" className="p-1 disabled:opacity-25">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-3">
          <input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="/catalog/micro-01.jpg"
            aria-label="Chemin de l'image"
            className={input}
          />
          <button type="button" onClick={addImage} disabled={!newImage.trim().startsWith("/")} aria-label="Ajouter l'image" className="p-2.5 border border-outline-variant disabled:opacity-40">
            <Plus size={16} />
          </button>
        </div>
        <p className="text-xs text-secondary mt-3">La première photo est la photo principale dans la boutique. Utilisez des photos d'au moins 1500 px de large.</p>
      </section>

      {/* Organization */}
      <section className={section}>
        <h2 className={sectionTitle}>Réglages boutique</h2>
        <div className="space-y-5">
          <div>
            <span className={label}>Catégories</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = form.categoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set("categoryIds", on ? form.categoryIds.filter((id) => id !== c.id) : [...form.categoryIds, c.id])}
                    className={`px-3 py-1.5 rounded-full text-xs border ${on ? "bg-primary text-on-primary border-primary" : "border-outline-variant hover:border-primary"}`}
                  >
                    {c.name}
                  </button>
                );
              })}
              <span className="flex items-center gap-1">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCategory();
                    }
                  }}
                  placeholder="Nouvelle catégorie"
                  maxLength={40}
                  className="w-36 bg-transparent border border-outline-variant rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                />
                <button type="button" onClick={addCategory} disabled={!newCategory.trim() || pending} aria-label="Ajouter la catégorie" className="p-1.5 rounded-full border border-outline-variant disabled:opacity-40">
                  <Plus size={14} />
                </button>
              </span>
            </div>
          </div>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="mt-0.5 accent-primary" />
            <span className="text-sm">
              Visible dans la boutique
              <span className="block text-xs text-secondary">Un produit masqué ne peut être ni trouvé ni commandé, mais ses commandes passées restent intactes.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={form.limited} onChange={(e) => set("limited", e.target.checked)} className="mt-0.5 accent-primary" />
            <span className="text-sm">
              Édition limitée
              <span className="block text-xs text-secondary">Affiche une étiquette « Édition limitée » sur la photo du produit.</span>
            </span>
          </label>
        </div>
      </section>

      {/* Sizes & stock */}
      <section className={section}>
        <h2 className={sectionTitle}>Variantes, prix et stock</h2>
        <div className="hidden md:grid grid-cols-[1fr_1.4fr_1.6fr_1.1fr_0.9fr_auto_auto] gap-2 text-[11px] text-secondary mb-2 px-1">
          <span>Variante</span>
          <span>Couleur</span>
          <span>Référence (auto si vide)</span>
          <span>Prix (DA)</span>
          <span>Stock</span>
          <span className="w-14 text-center">En vente</span>
          <span className="w-9" />
        </div>
        <div className="space-y-3 md:space-y-2">
          {form.variants.map((v, i) => (
            <div
              key={v.id ?? `new-${i}`}
              className={`grid grid-cols-2 md:grid-cols-[1fr_1.4fr_1.6fr_1.1fr_0.9fr_auto_auto] gap-2 items-start p-3 md:p-1 border md:border-0 border-outline-variant ${v.active ? "" : "opacity-60"}`}
            >
              {/* Labels show on phones, where the column headers are hidden. */}
              <label className="block">
                <span className={phoneLabel}>Variante</span>
                <input className={input} placeholder="128 Go" value={v.size} maxLength={20} onChange={(e) => setVariant(i, { size: e.target.value })} />
              </label>
              <label className="block">
                <span className={phoneLabel}>Couleur</span>
                <input className={input} placeholder="Noir" value={v.color} maxLength={40} onChange={(e) => setVariant(i, { color: e.target.value })} />
              </label>
              <label className="block col-span-2 md:col-span-1">
                <span className={phoneLabel}>Référence (auto si vide)</span>
                <input
                  className={`${input} uppercase`}
                  placeholder={skuFor(form.slug, v) || "Référence"}
                  value={v.sku}
                  maxLength={40}
                  onChange={(e) => setVariant(i, { sku: e.target.value })}
                />
              </label>
              <label className="block">
                <span className={phoneLabel}>Prix (DA)</span>
                <input className={input} placeholder="14500" inputMode="decimal" value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} />
              </label>
              <label className="block">
                <span className={phoneLabel}>Stock</span>
                <input
                  className={input}
                  type="number"
                  min={v.reservedStock ?? 0}
                  value={v.physicalStock}
                  onChange={(e) => setVariant(i, { physicalStock: Math.max(0, Math.trunc(Number(e.target.value) || 0)) })}
                />
                {!!v.reservedStock && <span className="block text-[11px] text-secondary mt-1">{v.reservedStock} réservé{v.reservedStock <= 1 ? "" : "s"}</span>}
              </label>
              <label className="flex items-center gap-2 md:w-14 md:justify-center h-10.5 text-sm">
                <input type="checkbox" checked={v.active} onChange={(e) => setVariant(i, { active: e.target.checked })} className="accent-primary" aria-label="En vente" />
                <span className="md:hidden">En vente</span>
              </label>
              <button
                type="button"
                onClick={() => set("variants", form.variants.filter((_, j) => j !== i))}
                disabled={v.hasOrders || form.variants.length === 1}
                title={v.hasOrders ? "Cette variante a des commandes : décochez « En vente » pour la masquer" : "Retirer"}
                aria-label="Retirer la variante"
                className="justify-self-end md:w-9 h-10.5 flex items-center justify-center text-error disabled:text-outline-variant"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("variants", [...form.variants, emptyVariant(form.variants.at(-1))])}
          className="mt-4 inline-flex items-center gap-1.5 text-sm hover:underline"
        >
          <Plus size={14} /> Ajouter une variante ou une couleur
        </button>
      </section>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-20 bg-surface/95 backdrop-blur border-t border-outline-variant">
        <div className="max-w-5xl px-5 md:px-10 py-3 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending} className="px-6 py-2.5 bg-primary text-on-primary text-xs font-medium tracking-label uppercase disabled:opacity-40">
            {pending ? "Enregistrement…" : isNew ? "Créer le produit" : "Enregistrer"}
          </button>
          <Link href="/admin/products" className="text-sm text-secondary hover:text-primary">Annuler</Link>
          {message && <span className={`text-sm ${message.ok ? "text-emerald-700" : "text-error"}`}>{message.text}</span>}
          {!isNew && (
            <button type="button" onClick={remove} disabled={pending} className="ml-auto text-sm text-error hover:underline disabled:opacity-40">
              Supprimer<span className="hidden sm:inline"> le produit</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
