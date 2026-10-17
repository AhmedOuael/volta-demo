import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

// Any URL that matches no route at all.
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <Link href="/" className="font-display text-4xl tracking-tighter mb-16">
        NOIR
      </Link>
      <p className="text-sm text-secondary mb-4">Error 404</p>
      <h1 className="font-display text-3xl md:text-5xl mb-6">This page isn&apos;t here</h1>
      <p className="text-on-surface-variant mb-12 max-w-md">Check the address, or continue to the collection.</p>
      <Link
        href="/products"
        className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity"
      >
        Shop the collection
      </Link>
    </div>
  );
}
