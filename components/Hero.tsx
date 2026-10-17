import Image from "next/image";
import Link from "@/components/brand/BrandLink";
import type { Brand } from "@/brands";
import { brandHref } from "@/lib/brand/routing";
import { imageUrl } from "@/lib/images";

export default function Hero({ brand }: { brand: Brand }) {
  const src = imageUrl(brand.heroImage);

  return (
    <section className="relative isolate min-h-[70svh] md:min-h-[78svh] overflow-hidden bg-black flex items-end">
      {src && (
        <Image src={src} alt="" fill preload quality={90} sizes="100vw" className="-z-10 object-cover opacity-70 motion-safe:animate-hero-photo" />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
      <div className="px-5 md:px-16 pb-14 md:pb-20 max-w-3xl">
        <p className="text-xs font-semibold tracking-label uppercase text-white/80 mb-4 motion-safe:animate-hero-text">{brand.deliveryPromise}</p>
        <h1 className="font-display font-extrabold text-white text-[2.5rem] leading-[1.05] md:text-6xl motion-safe:animate-hero-text">{brand.tagline}</h1>
        <Link
          href={brandHref("/products", brand.slug)}
          className="mt-9 inline-block rounded-md bg-primary px-7 py-3.5 text-[0.9375rem] font-semibold text-on-primary transition-opacity hover:opacity-90 motion-safe:animate-hero-text motion-safe:[animation-delay:200ms]"
        >
          Voir la boutique
        </Link>
      </div>
    </section>
  );
}
