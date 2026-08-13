import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { PrismaClient, Gender, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultPassword = process.env.DEFAULT_PASSWORD ?? "Dusun2026";
  const passwordHash = await hash(defaultPassword, 12);

  await prisma.user.upsert({
    where: { email: "ketua@tunasharapan.id" },
    update: {},
    create: {
      memberId: "KT-TH-2026-001",
      fullName: "Ketua Karang Taruna",
      email: "ketua@tunasharapan.id",
      passwordHash,
      isDefaultPassword: true,
      gender: Gender.L,
      phoneWa: "081234567890",
      rt: "01",
      rw: "01",
      address: "Dusun Kemitir",
      role: Role.KETUA,
      qrCodeToken: randomUUID(),
    },
  });

  console.log("Seed selesai. Akun awal: ketua@tunasharapan.id");
  console.log(`Password default: ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
