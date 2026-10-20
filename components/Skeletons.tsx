// Placeholders shown the moment a link is clicked (loading.tsx), while the page
// comes from the server. Grey blocks in the page's real layout, so nothing jumps.

const block = "rounded-md bg-surface-container motion-safe:animate-pulse";

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className={`${block} aspect-square mb-4`} />
          <div className={`${block} h-3 w-1/3 mb-2`} />
          <div className={`${block} h-4 w-4/5 mb-2`} />
          <div className={`${block} h-4 w-1/3`} />
        </div>
      ))}
    </div>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div className="px-5 md:px-16 py-16" role="status" aria-label="Chargement des produits">
      <div className="mb-10">
        <div className={`${block} h-3 w-24 mb-3`} />
        <div className={`${block} h-10 w-2/3 max-w-sm`} />
      </div>
      <div className="md:grid md:grid-cols-[220px_1fr] md:gap-10 lg:gap-14">
        <div className="hidden md:block space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${block} h-4 ${i % 2 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="px-5 md:px-16 py-12" role="status" aria-label="Chargement du produit">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        <div className={`${block} aspect-square rounded-lg`} />
        <div className="md:pt-2">
          <div className={`${block} h-3 w-1/3 mb-4`} />
          <div className={`${block} h-9 w-4/5 mb-5`} />
          <div className={`${block} h-6 w-1/4 mb-8`} />
          <div className={`${block} h-4 w-full mb-2`} />
          <div className={`${block} h-4 w-5/6 mb-8`} />
          <div className="flex gap-3 mb-8">
            <div className={`${block} h-12 w-28`} />
            <div className={`${block} h-12 w-28`} />
          </div>
          <div className={`${block} h-13 w-full rounded-full mb-3`} />
          <div className={`${block} h-13 w-full rounded-full`} />
        </div>
      </div>
    </div>
  );
}
