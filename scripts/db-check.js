const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const cs = process.env.DATABASE_URL;
const dbUrl = new URL(cs);
const pw = decodeURIComponent(dbUrl.password);
const pool = new pg.Pool({ connectionString: cs, password: pw });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    const count = await prisma.user.count();
    console.log("USER COUNT:", count);
    if (count > 0) {
      const users = await prisma.user.findMany({ select: { email: true, memberId: true, role: true, memberStatus: true, passwordHash: true } });
      users.forEach(u => console.log("USER:", u.email, "|", u.memberId, "|", u.role, "|", u.memberStatus, "|", u.passwordHash.slice(0, 20)));
    }
    const txCount = await prisma.cashTransaction.count();
    console.log("TX COUNT:", txCount);
  } catch (err) {
    console.error("DB CHECK ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
