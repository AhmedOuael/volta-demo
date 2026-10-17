import Link from "@/components/brand/BrandLink";

// Shown inside the shop (with header and footer), e.g. for a product that no longer exists.
export default function StorefrontNotFound() {
  return (
    <div className="px-5 md:px-16 py-32 text-center max-w-xl mx-auto">
      <p className="text-sm text-secondary mb-4">Erreur 404</p>
      <h1 className="font-display text-3xl md:text-5xl mb-6">Cette page n&apos;existe pas</h1>
      <p className="text-on-surface-variant mb-12">
        Le produit a peut-être été épuisé ou retiré. Le reste de la boutique est à un clic.
      </p>
      <Link
        href="/products"
        className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity"
      >
        Voir la boutique
      </Link>
    </div>
  );
}
