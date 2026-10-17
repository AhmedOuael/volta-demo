import type { Metadata } from "next";
import "./globals.css";
import { BrandProvider } from "@/components/brand/BrandProvider";
import { getBrand } from "@/lib/brand/server";
import { brandCssVars } from "@/lib/brand/theme";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const isPrivate = brand.visibility === "private";
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${brand.name} | ${brand.tagline}`, template: `%s | ${brand.name}` },
    description: `${brand.tagline}. ${brand.deliveryPromise}.`,
    icons: { icon: brand.logo },
    // Private previews are proposals for one store: never indexed (proxy.ts also sends X-Robots-Tag).
    robots: isPrivate ? { index: false, follow: false } : undefined,
    openGraph: isPrivate ? undefined : { type: "website", siteName: brand.name, title: brand.name, description: brand.tagline, url: "/" },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const brand = await getBrand();
  return (
    <html lang="fr" style={brandCssVars(brand) as React.CSSProperties}>
      <body className="min-h-screen antialiased bg-surface text-on-surface" suppressHydrationWarning>
        <BrandProvider brand={brand}>{children}</BrandProvider>
      </body>
    </html>
  );
}
