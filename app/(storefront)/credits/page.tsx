import type { Metadata } from "next";
import Image from "next/image";
import { CREDITS } from "@/lib/credits";
import { DEMO_PRODUCTS, demoImage } from "@/prisma/data/demo-products";

export const metadata: Metadata = {
  title: "Crédits photos",
  description: "Les photos de cette boutique de démonstration et leurs auteurs.",
};

const nameByFile = new Map(DEMO_PRODUCTS.map((p) => [demoImage(p.slug), p.name]));

export default function CreditsPage() {
  return (
    <div className="px-5 md:px-16 py-16 md:py-24 max-w-5xl">
      <h1 className="font-display text-3xl md:text-5xl font-extrabold mb-4">Crédits photos</h1>
      <p className="text-on-surface-variant mb-10 max-w-2xl">
        Boutique de démonstration : les produits et les marques sont fictifs. Les photos viennent d&apos;Unsplash et de Pexels,
        sous leur licence gratuite. Merci à leurs auteurs.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CREDITS.map((c) => (
          <li key={c.file} className="flex items-center gap-3 border border-outline-variant p-3">
            <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-surface-container">
              <Image src={c.file} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-medium truncate">{nameByFile.get(c.file) ?? "Photo d'accueil"}</p>
              <p className="text-on-surface-variant">
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary">
                  {c.author}
                </a>{" "}
                · {c.source}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
