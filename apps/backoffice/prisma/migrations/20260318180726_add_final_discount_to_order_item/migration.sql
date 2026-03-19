-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "finalDiscountAmount" DOUBLE PRECISION,
ADD COLUMN     "finalDiscountDate" TIMESTAMP(3),
ADD COLUMN     "finalDiscountNote" TEXT;
