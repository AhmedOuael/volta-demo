import type { Metadata } from "next";
import { getBrand } from "@/lib/brand/server";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return { title: { absolute: `${brand.name} · Administration` }, robots: { index: false, follow: false } };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface">{children}</div>;
}
