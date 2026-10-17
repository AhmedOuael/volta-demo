import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { getBrand } from "@/lib/brand/server";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return { title: "Contact", description: `Une question sur une commande ou un produit ? Contactez ${brand.name}.` };
}

export default async function ContactPage() {
  const brand = await getBrand();
  const phone = (process.env.STORE_WHATSAPP ?? "").replace(/\D/g, "");
  const prefix = brand.visibility === "private" ? `[Démo ${brand.name}] ` : "";
  const waLink = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`${prefix}Bonjour, j'ai une question.`)}` : null;

  return (
    <div className="px-5 md:px-16 py-16 md:py-24 max-w-2xl">
      <h1 className="font-display text-3xl md:text-5xl font-extrabold mb-6">Nous contacter</h1>
      <p className="text-lg text-on-surface-variant mb-10">
        Une question sur un produit, une commande ou la livraison ? Écrivez-nous sur WhatsApp, nous répondons rapidement.
      </p>
      {waLink && (
        <a href={waLink} target="_blank" rel="noopener" className="inline-flex items-center gap-3 rounded-md bg-primary px-7 py-3.5 font-semibold text-on-primary hover:opacity-90">
          <MessageCircle size={20} aria-hidden="true" /> Écrire sur WhatsApp
        </a>
      )}
      <div className="mt-12 space-y-2 text-on-surface-variant">
        <p>{brand.deliveryPromise}</p>
        {brand.instagram && (
          <p>
            Instagram :{" "}
            <a href={`https://www.instagram.com/${brand.instagram}/`} target="_blank" rel="noopener" className="underline">
              @{brand.instagram}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
