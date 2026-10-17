import Link from "@/components/brand/BrandLink";
import { requireUser } from "@/lib/auth/session";
import { listCategories } from "@/lib/admin/products";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  await requireUser("ADMIN");
  const categories = await listCategories();

  return (
    <div>
      <Link href="/admin/products" className="text-xs tracking-label uppercase text-secondary hover:text-primary">
        ← All products
      </Link>
      <h1 className="font-display text-3xl mt-3 mb-8">New product</h1>
      <ProductForm
        categories={categories}
        initial={{
          name: "",
          slug: "",
          description: "",
          details: [],
          limited: false,
          active: true,
          categoryIds: [],
          images: [],
          variants: ["S", "M", "L", "XL"].map((size) => ({ size, color: "", sku: "", price: "", physicalStock: 0, active: true })),
        }}
      />
    </div>
  );
}
