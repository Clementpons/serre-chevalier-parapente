-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MONITEUR', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."StageType" AS ENUM ('INITIATION', 'PROGRESSION', 'AUTONOMIE', 'DOUBLE');

-- CreateEnum
CREATE TYPE "public"."StageBookingType" AS ENUM ('INITIATION', 'PROGRESSION', 'AUTONOMIE');

-- CreateEnum
CREATE TYPE "public"."BaptemeCategory" AS ENUM ('AVENTURE', 'DUREE', 'LONGUE_DUREE', 'ENFANT', 'HIVER');

-- CreateEnum
CREATE TYPE "public"."CartItemType" AS ENUM ('STAGE', 'BAPTEME', 'GIFT_VOUCHER');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."AudienceRuleType" AS ENUM ('CLIENT_RESERVED_STAGE', 'CLIENT_RESERVED_BAPTEME', 'STAGIAIRE_STAGE', 'STAGIAIRE_BAPTEME', 'PURCHASED_GIFT_VOUCHER', 'ORDER_ABOVE_AMOUNT');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."SmsStatus" AS ENUM ('ACCEPTED', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'UNDELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."VoucherProductType" AS ENUM ('STAGE', 'BAPTEME');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'CONFIRMED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ManualPaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'CASH', 'CHECK');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('STRIPE', 'MANUAL', 'GIFT_VOUCHER');

-- CreateTable
CREATE TABLE "public"."BaptemeCategoryPrice" (
    "id" TEXT NOT NULL,
    "category" "public"."BaptemeCategory" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaptemeCategoryPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VideoOptionPrice" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoOptionPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BaptemeDepositPrice" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 35.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaptemeDepositPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StageBasePrice" (
    "id" TEXT NOT NULL,
    "stageType" "public"."StageType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageBasePrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stage" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 7,
    "places" INTEGER NOT NULL DEFAULT 6,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 350.0,
    "allTimeHighPrice" DOUBLE PRECISION NOT NULL,
    "acomptePrice" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "type" "public"."StageType" NOT NULL DEFAULT 'INITIATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StageMoniteur" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "moniteurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageMoniteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bapteme" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 120,
    "places" INTEGER NOT NULL DEFAULT 6,
    "categories" "public"."BaptemeCategory"[],
    "acomptePrice" DOUBLE PRECISION NOT NULL DEFAULT 35.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bapteme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BaptemeMoniteur" (
    "id" TEXT NOT NULL,
    "baptemeId" TEXT NOT NULL,
    "moniteurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaptemeMoniteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StageBooking" (
    "id" TEXT NOT NULL,
    "type" "public"."StageBookingType" NOT NULL DEFAULT 'INITIATION',
    "stageId" TEXT NOT NULL,
    "stagiaireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BaptemeBooking" (
    "id" TEXT NOT NULL,
    "baptemeId" TEXT NOT NULL,
    "stagiaireId" TEXT NOT NULL,
    "category" "public"."BaptemeCategory" NOT NULL,
    "hasVideo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaptemeBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "recipientNote" TEXT,
    "discountType" "public"."DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxDiscountAmount" DOUBLE PRECISION,
    "minCartAmount" DOUBLE PRECISION,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoCodeUsage" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "discountApplied" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCodeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Audience" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AudienceRule" (
    "id" TEXT NOT NULL,
    "audienceId" TEXT NOT NULL,
    "ruleType" "public"."AudienceRuleType" NOT NULL,
    "stageType" "public"."StageBookingType",
    "baptemeCategory" "public"."BaptemeCategory",
    "minOrderAmount" DOUBLE PRECISION,
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudienceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AudienceContact" (
    "id" TEXT NOT NULL,
    "audienceId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudienceContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SmsCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "generatePromoCode" BOOLEAN NOT NULL DEFAULT false,
    "promoDiscountType" "public"."DiscountType",
    "promoDiscountValue" DOUBLE PRECISION,
    "promoMaxDiscountAmount" DOUBLE PRECISION,
    "promoMinCartAmount" DOUBLE PRECISION,
    "promoMaxUses" INTEGER,
    "promoExpiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SmsCampaignLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientName" TEXT,
    "messageSid" TEXT,
    "status" "public"."SmsStatus" NOT NULL DEFAULT 'QUEUED',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsCampaignLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GiftVoucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "productType" "public"."VoucherProductType" NOT NULL,
    "stageCategory" "public"."StageBookingType",
    "baptemeCategory" "public"."BaptemeCategory",
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "clientId" TEXT,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "reservedBySessionId" TEXT,
    "reservedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stagiaire" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stagiaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "avatarUrl" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" TEXT NOT NULL,
    "type" "public"."CartItemType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "stageId" TEXT,
    "baptemeId" TEXT,
    "giftCardAmount" DOUBLE PRECISION,
    "giftVoucherCode" TEXT,
    "giftVoucherAmount" DOUBLE PRECISION,
    "participantData" JSONB NOT NULL,
    "cartSessionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemporaryReservation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stageId" TEXT,
    "baptemeId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemporaryReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "promoCodeId" TEXT,
    "promoDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "public"."CartItemType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "stageId" TEXT,
    "baptemeId" TEXT,
    "giftVoucherAmount" DOUBLE PRECISION,
    "generatedGiftVoucherId" TEXT,
    "usedGiftVoucherId" TEXT,
    "participantData" JSONB NOT NULL,
    "depositAmount" DOUBLE PRECISION,
    "remainingAmount" DOUBLE PRECISION,
    "isFullyPaid" BOOLEAN NOT NULL DEFAULT false,
    "finalPaymentDate" TIMESTAMP(3),
    "finalPaymentNote" TEXT,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "effectiveDepositAmount" DOUBLE PRECISION,
    "effectiveRemainingAmount" DOUBLE PRECISION,
    "stageBookingId" TEXT,
    "baptemeBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentAllocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "allocatedAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL DEFAULT 'STRIPE',
    "stripePaymentIntentId" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "stripeMetadata" JSONB,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "manualPaymentMethod" "public"."ManualPaymentMethod",
    "manualPaymentNote" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProcessedWebhookEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TopBar" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "secondaryText" TEXT,
    "ctaTitle" TEXT,
    "ctaLink" TEXT,
    "ctaIsFull" BOOLEAN NOT NULL DEFAULT false,
    "ctaIsExternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopBar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AudienceToSmsCampaign" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AudienceToSmsCampaign_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "BaptemeCategoryPrice_category_key" ON "public"."BaptemeCategoryPrice"("category");

-- CreateIndex
CREATE UNIQUE INDEX "StageBasePrice_stageType_key" ON "public"."StageBasePrice"("stageType");

-- CreateIndex
CREATE UNIQUE INDEX "StageMoniteur_stageId_moniteurId_key" ON "public"."StageMoniteur"("stageId", "moniteurId");

-- CreateIndex
CREATE UNIQUE INDEX "Bapteme_date_key" ON "public"."Bapteme"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BaptemeMoniteur_baptemeId_moniteurId_key" ON "public"."BaptemeMoniteur"("baptemeId", "moniteurId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "public"."PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "public"."PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_isActive_idx" ON "public"."PromoCode"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeUsage_orderId_key" ON "public"."PromoCodeUsage"("orderId");

-- CreateIndex
CREATE INDEX "PromoCodeUsage_promoCodeId_idx" ON "public"."PromoCodeUsage"("promoCodeId");

-- CreateIndex
CREATE INDEX "AudienceRule_audienceId_idx" ON "public"."AudienceRule"("audienceId");

-- CreateIndex
CREATE INDEX "AudienceContact_audienceId_idx" ON "public"."AudienceContact"("audienceId");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceContact_audienceId_phone_key" ON "public"."AudienceContact"("audienceId", "phone");

-- CreateIndex
CREATE INDEX "SmsCampaign_status_idx" ON "public"."SmsCampaign"("status");

-- CreateIndex
CREATE INDEX "SmsCampaignLog_campaignId_idx" ON "public"."SmsCampaignLog"("campaignId");

-- CreateIndex
CREATE INDEX "SmsCampaignLog_status_idx" ON "public"."SmsCampaignLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GiftVoucher_code_key" ON "public"."GiftVoucher"("code");

-- CreateIndex
CREATE INDEX "GiftVoucher_code_idx" ON "public"."GiftVoucher"("code");

-- CreateIndex
CREATE INDEX "GiftVoucher_isUsed_idx" ON "public"."GiftVoucher"("isUsed");

-- CreateIndex
CREATE INDEX "GiftVoucher_reservedBySessionId_idx" ON "public"."GiftVoucher"("reservedBySessionId");

-- CreateIndex
CREATE INDEX "GiftVoucher_expiryDate_idx" ON "public"."GiftVoucher"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "public"."Client"("email");

-- CreateIndex
CREATE INDEX "Stagiaire_email_idx" ON "public"."Stagiaire"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "CartSession_sessionId_key" ON "public"."CartSession"("sessionId");

-- CreateIndex
CREATE INDEX "CartSession_expiresAt_idx" ON "public"."CartSession"("expiresAt");

-- CreateIndex
CREATE INDEX "CartSession_sessionId_idx" ON "public"."CartSession"("sessionId");

-- CreateIndex
CREATE INDEX "CartItem_cartSessionId_idx" ON "public"."CartItem"("cartSessionId");

-- CreateIndex
CREATE INDEX "CartItem_expiresAt_idx" ON "public"."CartItem"("expiresAt");

-- CreateIndex
CREATE INDEX "CartItem_isExpired_idx" ON "public"."CartItem"("isExpired");

-- CreateIndex
CREATE INDEX "TemporaryReservation_expiresAt_idx" ON "public"."TemporaryReservation"("expiresAt");

-- CreateIndex
CREATE INDEX "TemporaryReservation_sessionId_idx" ON "public"."TemporaryReservation"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_clientId_idx" ON "public"."Order"("clientId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "public"."Order"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_generatedGiftVoucherId_key" ON "public"."OrderItem"("generatedGiftVoucherId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_usedGiftVoucherId_key" ON "public"."OrderItem"("usedGiftVoucherId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_stageBookingId_key" ON "public"."OrderItem"("stageBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_baptemeBookingId_key" ON "public"."OrderItem"("baptemeBookingId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "PaymentAllocation_paymentId_idx" ON "public"."PaymentAllocation"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentAllocation_orderItemId_idx" ON "public"."PaymentAllocation"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_orderItemId_key" ON "public"."PaymentAllocation"("paymentId", "orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "public"."Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "public"."Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "public"."Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "public"."Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_isManual_createdAt_idx" ON "public"."Payment"("status", "isManual", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_paymentType_createdAt_idx" ON "public"."Payment"("status", "paymentType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedWebhookEvent_stripeEventId_key" ON "public"."ProcessedWebhookEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "ProcessedWebhookEvent_stripeEventId_idx" ON "public"."ProcessedWebhookEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "ProcessedWebhookEvent_eventType_idx" ON "public"."ProcessedWebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "_AudienceToSmsCampaign_B_index" ON "public"."_AudienceToSmsCampaign"("B");

-- AddForeignKey
ALTER TABLE "public"."StageMoniteur" ADD CONSTRAINT "StageMoniteur_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StageMoniteur" ADD CONSTRAINT "StageMoniteur_moniteurId_fkey" FOREIGN KEY ("moniteurId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BaptemeMoniteur" ADD CONSTRAINT "BaptemeMoniteur_baptemeId_fkey" FOREIGN KEY ("baptemeId") REFERENCES "public"."Bapteme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BaptemeMoniteur" ADD CONSTRAINT "BaptemeMoniteur_moniteurId_fkey" FOREIGN KEY ("moniteurId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StageBooking" ADD CONSTRAINT "StageBooking_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StageBooking" ADD CONSTRAINT "StageBooking_stagiaireId_fkey" FOREIGN KEY ("stagiaireId") REFERENCES "public"."Stagiaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BaptemeBooking" ADD CONSTRAINT "BaptemeBooking_baptemeId_fkey" FOREIGN KEY ("baptemeId") REFERENCES "public"."Bapteme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BaptemeBooking" ADD CONSTRAINT "BaptemeBooking_stagiaireId_fkey" FOREIGN KEY ("stagiaireId") REFERENCES "public"."Stagiaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoCode" ADD CONSTRAINT "PromoCode_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."SmsCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoCodeUsage" ADD CONSTRAINT "PromoCodeUsage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "public"."PromoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromoCodeUsage" ADD CONSTRAINT "PromoCodeUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AudienceRule" ADD CONSTRAINT "AudienceRule_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "public"."Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AudienceContact" ADD CONSTRAINT "AudienceContact_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "public"."Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SmsCampaignLog" ADD CONSTRAINT "SmsCampaignLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."SmsCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GiftVoucher" ADD CONSTRAINT "GiftVoucher_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_baptemeId_fkey" FOREIGN KEY ("baptemeId") REFERENCES "public"."Bapteme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartSessionId_fkey" FOREIGN KEY ("cartSessionId") REFERENCES "public"."CartSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemporaryReservation" ADD CONSTRAINT "TemporaryReservation_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemporaryReservation" ADD CONSTRAINT "TemporaryReservation_baptemeId_fkey" FOREIGN KEY ("baptemeId") REFERENCES "public"."Bapteme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "public"."PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "public"."Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_baptemeId_fkey" FOREIGN KEY ("baptemeId") REFERENCES "public"."Bapteme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_generatedGiftVoucherId_fkey" FOREIGN KEY ("generatedGiftVoucherId") REFERENCES "public"."GiftVoucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_usedGiftVoucherId_fkey" FOREIGN KEY ("usedGiftVoucherId") REFERENCES "public"."GiftVoucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_stageBookingId_fkey" FOREIGN KEY ("stageBookingId") REFERENCES "public"."StageBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_baptemeBookingId_fkey" FOREIGN KEY ("baptemeBookingId") REFERENCES "public"."BaptemeBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AudienceToSmsCampaign" ADD CONSTRAINT "_AudienceToSmsCampaign_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AudienceToSmsCampaign" ADD CONSTRAINT "_AudienceToSmsCampaign_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."SmsCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
