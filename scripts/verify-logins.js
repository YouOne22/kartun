/**
 * Dev helper: verify that the expected login accounts accept the configured
 * DEFAULT_PASSWORD ("kartunmaju") by bcrypt-comparing against the stored hash.
 * Usage: node scripts/verify-logins.js   (requires DATABASE_URL in env)
 */
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
const dotenv = require("dotenv");
const { compare } = require("bcryptjs");

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const dbUrl = new URL(connectionString);
const password = decodeURIComponent(dbUrl.password);
const pool = new pg.Pool({ connectionString, password });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  const expected = process.env.DEFAULT_PASSWORD || "kartunmaju";
  const emails = ["ketua@tunasharapan.id", "dev@tunasharapan.id"];
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true, memberId: true, role: true, isDefaultPassword: true, passwordHash: true },
  });

  if (users.length === 0) {
    console.log("Tidak ada akun ditemukan. Emails:", emails);
  }

  for (const u of users) {
    const ok = await compare(expected, u.passwordHash);
    console.log(
      `${u.email} | memberId=${u.memberId} | role=${u.role} | isDefault=${u.isDefaultPassword} | pw("${expected}")=${ok}`,
    );
  }

  await prisma.$disconnect();
})();
