-- V3 Schema Changes
-- - Remove Bapteme.date @unique (multiple baptemes per day allowed)
-- - Add shortCode to StageBooking and BaptemeBooking
-- - Remove giftCardAmount from CartItem (dead code)
-- - Client.email required + RGPD consent fields on Client and Stagiaire
-- - ProcessedWebhookEvent.orderId for debugging
-- - Stage: remove allTimeHighPrice, add promotionOriginalPrice/EndDate/Reason
-- - StageBasePrice: add defaultAcomptePrice per stage type
-- - New table: StagePromotionHistory

-- DropIndex
DROP INDEX "public"."Bapteme_date_key";

-- AlterTable
ALTER TABLE "public"."BaptemeBooking" ADD COLUMN     "shortCode" TEXT;

-- AlterTable
ALTER TABLE "public"."CartItem" DROP COLUMN "giftCardAmount";

-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "rgpdConsentAt" TIMESTAMP(3),
ADD COLUMN     "rgpdConsentIp" TEXT,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProcessedWebhookEvent" ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "public"."Stage" DROP COLUMN "allTimeHighPrice",
ADD COLUMN     "promotionEndDate" TIMESTAMP(3),
ADD COLUMN     "promotionOriginalPrice" DOUBLE PRECISION,
ADD COLUMN     "promotionReason" TEXT;

-- AlterTable
ALTER TABLE "public"."StageBasePrice" ADD COLUMN     "defaultAcomptePrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."StageBooking" ADD COLUMN     "shortCode" TEXT;

-- AlterTable
ALTER TABLE "public"."Stagiaire" ADD COLUMN     "rgpdConsentAt" TIMESTAMP(3),
ADD COLUMN     "rgpdConsentIp" TEXT;

-- CreateTable
CREATE TABLE "public"."StagePromotionHistory" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "promotedPrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "endDate" TIMESTAMP(3),
    "appliedBy" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StagePromotionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StagePromotionHistory_stageId_idx" ON "public"."StagePromotionHistory"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "BaptemeBooking_shortCode_key" ON "public"."BaptemeBooking"("shortCode");

-- CreateIndex
CREATE INDEX "BaptemeBooking_baptemeId_idx" ON "public"."BaptemeBooking"("baptemeId");

-- CreateIndex
CREATE INDEX "BaptemeBooking_stagiaireId_idx" ON "public"."BaptemeBooking"("stagiaireId");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "public"."Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StageBooking_shortCode_key" ON "public"."StageBooking"("shortCode");

-- CreateIndex
CREATE INDEX "StageBooking_stageId_idx" ON "public"."StageBooking"("stageId");

-- CreateIndex
CREATE INDEX "StageBooking_stagiaireId_idx" ON "public"."StageBooking"("stagiaireId");

-- AddForeignKey
ALTER TABLE "public"."StagePromotionHistory" ADD CONSTRAINT "StagePromotionHistory_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
