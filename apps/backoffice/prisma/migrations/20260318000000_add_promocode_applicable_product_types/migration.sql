-- AlterTable: add applicableProductTypes to PromoCode
ALTER TABLE "PromoCode" ADD COLUMN "applicableProductTypes" "CartItemType"[] NOT NULL DEFAULT ARRAY[]::"CartItemType"[];
