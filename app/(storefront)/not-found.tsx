import Link from "next/link";

// Shown inside the shop (with header and footer), e.g. for a product that no longer exists.
export default function StorefrontNotFound() {
  return (
    <div className="px-5 md:px-16 py-32 text-center max-w-xl mx-auto">
      <p className="text-sm text-secondary mb-4">Error 404</p>
      <h1 className="font-display text-3xl md:text-5xl mb-6">This page isn&apos;t here</h1>
      <p className="text-on-surface-variant mb-12">
        The product may have sold out or been removed. The rest of the collection is one click away.
      </p>
      <Link
        href="/products"
        className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity"
      >
        Shop the collection
      </Link>
    </div>
  );
}
