-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "maker" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "specs" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "storeSlug" TEXT NOT NULL DEFAULT 'volta';

-- CreateIndex
CREATE INDEX "Product_maker_idx" ON "Product"("maker");

-- CreateIndex
CREATE INDEX "Order_storeSlug_createdAt_idx" ON "Order"("storeSlug", "createdAt");
