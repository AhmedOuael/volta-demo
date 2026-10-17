import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "LE Admin" }, // absolute: skip the storefront's "| NOIR" title suffix
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface">{children}</div>;
}
