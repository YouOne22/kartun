-- CreateEnum
CREATE TYPE "role_enum" AS ENUM ('KETUA', 'SEKRETARIS', 'BENDAHARA', 'ANGGOTA');

-- CreateEnum
CREATE TYPE "gender_enum" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "member_status_enum" AS ENUM ('AKTIF', 'NON_AKTIF');

-- CreateEnum
CREATE TYPE "approval_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "visibility_enum" AS ENUM ('PUBLIC', 'INTERNAL');

-- CreateEnum
CREATE TYPE "cash_type_enum" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "member_id" VARCHAR(30) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_default_password" BOOLEAN NOT NULL DEFAULT true,
    "nik" VARCHAR(16),
    "gender" "gender_enum" NOT NULL,
    "birth_place" VARCHAR(50),
    "birth_date" DATE,
    "phone_wa" VARCHAR(20) NOT NULL,
    "dusun" VARCHAR(50) NOT NULL DEFAULT 'Kemitir',
    "rt" VARCHAR(5) NOT NULL,
    "rw" VARCHAR(5) NOT NULL,
    "address" TEXT,
    "education" VARCHAR(30),
    "occupation" VARCHAR(50),
    "join_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "member_status" "member_status_enum" NOT NULL DEFAULT 'AKTIF',
    "role" "role_enum" NOT NULL DEFAULT 'ANGGOTA',
    "avatar_url" TEXT,
    "qr_code_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" TEXT NOT NULL,
    "attachment_url" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "visibility_enum" NOT NULL DEFAULT 'PUBLIC',
    "author_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_transactions" (
    "id" UUID NOT NULL,
    "transaction_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "cash_type_enum" NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_loans" (
    "id" UUID NOT NULL,
    "borrower_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "loan_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" DATE,
    "notes" TEXT,
    "status" "approval_status_enum" NOT NULL DEFAULT 'PENDING',
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "settled_at" TIMESTAMP(3),
    "approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "item_code" VARCHAR(30) NOT NULL,
    "item_name" VARCHAR(100) NOT NULL,
    "total_qty" INTEGER NOT NULL DEFAULT 1,
    "available_qty" INTEGER NOT NULL DEFAULT 1,
    "condition" VARCHAR(50) NOT NULL DEFAULT 'Baik',
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_borrowings" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "borrower_id" UUID NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "borrow_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_date" DATE,
    "actual_return_date" DATE,
    "purpose" TEXT,
    "status" "approval_status_enum" NOT NULL DEFAULT 'PENDING',
    "approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_borrowings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL,
    "location" VARCHAR(100) NOT NULL,
    "event_qr_token" TEXT NOT NULL,
    "visibility" "visibility_enum" NOT NULL DEFAULT 'INTERNAL',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendances" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scan_method" VARCHAR(20) NOT NULL DEFAULT 'SELF_SCAN',

    CONSTRAINT "event_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_documentations" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "uploader_id" UUID,
    "photo_url_hd" TEXT NOT NULL,
    "photo_url_thumb" TEXT NOT NULL,
    "caption" TEXT,
    "status" "approval_status_enum" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_documentations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_reports" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "notlen_text" TEXT NOT NULL,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "details" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_member_id_key" ON "users"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "users_qr_code_token_key" ON "users"("qr_code_token");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_item_code_key" ON "inventory_items"("item_code");

-- CreateIndex
CREATE UNIQUE INDEX "events_event_qr_token_key" ON "events"("event_qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendances_event_id_member_id_key" ON "event_attendances"("event_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_reports_event_id_key" ON "event_reports"("event_id");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_loans" ADD CONSTRAINT "financial_loans_borrower_id_fkey" FOREIGN KEY ("borrower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_loans" ADD CONSTRAINT "financial_loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_borrowings" ADD CONSTRAINT "inventory_borrowings_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_borrowings" ADD CONSTRAINT "inventory_borrowings_borrower_id_fkey" FOREIGN KEY ("borrower_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_borrowings" ADD CONSTRAINT "inventory_borrowings_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendances" ADD CONSTRAINT "event_attendances_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_documentations" ADD CONSTRAINT "event_documentations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_documentations" ADD CONSTRAINT "event_documentations_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_documentations" ADD CONSTRAINT "event_documentations_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reports" ADD CONSTRAINT "event_reports_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reports" ADD CONSTRAINT "event_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

