/**
 * One-off dev helper: creates a dedicated developer account for local
 * bug-monitoring / development access.
 *
 * WHY A SEPARATE SCRIPT (not prisma/seed.ts):
 *  - Keeps the dev account out of the production seed so it never ships
 *    to a real deployment. Existing production users won't see it.
 *  - Idempotent (upsert) so it can be re-run safely.
 *
 * Role: KETUA (already has FULL access across every RBAC guard via
 * roleGroups.allStaff / leadership / finance / loanView in src/lib/api.ts,
 * so no schema or RBAC change is required).
 *
 * isDefaultPassword is set to FALSE on purpose so login is direct with the
 * default password and the forced /change-password redirect is NOT triggered
 * (convenient for a long-lived dev account).
 */
import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { PrismaClient, Gender, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const dbUrl = new URL(connectionString);
const password = decodeURIComponent(dbUrl.password);

const pool = new pg.Pool({ connectionString, password });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultPassword = process.env.DEFAULT_PASSWORD || "kartunmaju";
  const passwordHash = await hash(defaultPassword, 12);

  const email = "dev@tunasharapan.id";
  const memberId = "KT-TH-2026-000";
  const fullName = "Dev Monitor";

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      role: Role.KETUA,
      isDefaultPassword: false,
    },
    create: {
      memberId,
      fullName,
      email,
      passwordHash,
            isDefaultPassword: false,
      role: Role.KETUA,
      gender: Gender.L,
      phoneWa: "080000000000",
      rt: "00",
      rw: "00",
      dusun: "Kemitir",
      address: "Akun developer lokal (bug-monitoring)",
      qrCodeToken: randomUUID(),
    },
    select: {
      id: true,
      memberId: true,
      email: true,
      fullName: true,
      role: true,
      isDefaultPassword: true,
    },
  });

  console.log("Akun dev berhasil dibuat/diperbarui:");
  console.log(JSON.stringify(user, null, 2));
  console.log(`\nLogin -> email: ${email}  password: ${defaultPassword}  role: ${user.role}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
