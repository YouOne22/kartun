-- CreateTable
CREATE TABLE "LoanPayment" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoanPayment" ADD CONSTRAINT "LoanPayment_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "financial_loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
