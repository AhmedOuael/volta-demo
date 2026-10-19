import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/motion/SmoothScroll";
import MotionEffects from "@/components/motion/MotionEffects";
import type { SearchItem } from "@/components/HeaderSearch";
import { getProducts } from "@/lib/catalog";
import { priceLabel } from "@/lib/merchandising";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  // The header's instant search works on this small list (lib/search.ts).
  const searchItems: SearchItem[] = (await getProducts()).map((p) => ({
    slug: p.slug,
    name: p.name,
    maker: p.maker,
    categories: p.categories,
    image: p.image,
    price: priceLabel(p),
  }));

  return (
    <>
      <SmoothScroll />
      <MotionEffects />
      <Header searchItems={searchItems} />
      <CategoryBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
