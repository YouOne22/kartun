import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized } from "@/lib/api";

type ChartPoint = { month: string; income: number; expense: number };
type FinancialSummaryGroup = { sumberKas: string; data: ChartPoint[] };
type DonutItemGroup = { name: string; value: number; color: string };
type DonutSummaryGroup = { sumberKas: string; data: DonutItemGroup[] };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabels(count: number, offset = 0): string[] {
  const now = new Date();
  const start = (now.getMonth() + 1 - count + offset + 12) % 12;
  return Array.from({ length: count }, (_, i) => MONTHS[(start + i) % 12]);
}

export async function GET() {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startOfNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const [members, activeMembers, announcements, pendingLoans, upcomingEvents, monthlyTx, sourceTx] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { memberStatus: "AKTIF" } }),
      prisma.announcement.count({ where: { visibility: "PUBLIC" } }),
      prisma.financialLoan.count({ where: { status: "PENDING" } }),
      prisma.event.findMany({ where: { eventDate: { gte: new Date() }, ...(auth.session.role === "ANGGOTA" ? { visibility: "PUBLIC" } : {}) }, orderBy: { eventDate: "asc" }, take: 5, select: { id: true, title: true, eventDate: true, location: true } }),
      prisma.cashTransaction.groupBy({
        by: ["type", "sumberKas", "transactionDate"],
        where: { transactionDate: { gte: sixMonthsAgo, lt: startOfNext } },
        _sum: { amount: true },
        orderBy: { transactionDate: "asc" },
      }),
      prisma.cashTransaction.groupBy({
        by: ["type", "sumberKas"],
        _sum: { amount: true },
      }),
    ]);

    const labels = monthLabels(6);
    const buildSeries = (): Record<string, ChartPoint> => { const s: Record<string, ChartPoint> = {}; labels.forEach((m) => { s[m] = { month: m, income: 0, expense: 0 }; }); return s; };

    // Group area chart data by sumberKas
    const areaBySource: Record<string, Record<string, ChartPoint>> = { INDUK: buildSeries(), JIMPITAN: buildSeries() };
    monthlyTx.forEach((row) => {
      const d = new Date(row.transactionDate);
      const month = MONTHS[d.getMonth()];
      const source = String(row.sumberKas);
      const target = areaBySource[source];
      if (!target || !target[month]) return;
      if (row.type === "INCOME") target[month].income += Number(row._sum.amount ?? 0);
      else if (row.type === "EXPENSE") target[month].expense += Number(row._sum.amount ?? 0);
    });
    const financialSummary: FinancialSummaryGroup[] = ["INDUK", "JIMPITAN"].map((s) => ({ sumberKas: s, data: Object.values(areaBySource[s]) }));

    // Build Donut data per sumberKas
    const donutBySource: Record<string, { name: string; value: number; color: string }[]> = {
      INDUK: [{ name: "Pemasukan", value: 0, color: "#059669" }, { name: "Pengeluaran", value: 0, color: "#F97316" }],
      JIMPITAN: [{ name: "Pemasukan", value: 0, color: "#059669" }, { name: "Pengeluaran", value: 0, color: "#F97316" }],
    };
    sourceTx.forEach((row) => {
      const source = String(row.sumberKas);
      if (!donutBySource[source]) return;
      const target = donutBySource[source];
      if (row.type === "INCOME") target[0].value += Number(row._sum.amount ?? 0);
      else if (row.type === "EXPENSE") target[1].value += Number(row._sum.amount ?? 0);
    });
    const donutData: DonutSummaryGroup[] = ["INDUK", "JIMPITAN"].map((s) => ({ sumberKas: s, data: donutBySource[s] }));

    const incomeTotal = Number(sourceTx.filter((r) => r.type === "INCOME").reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0));
    const expenseTotal = Number(sourceTx.filter((r) => r.type === "EXPENSE").reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0));

    return NextResponse.json({
      stats: { members, activeMembers, announcements, balance: incomeTotal - expenseTotal, pendingLoans },
      upcomingEvents,
      financialSummary,
      donutData,
    });
  } catch (error) {
    console.error("Dashboard error", error);
    return NextResponse.json({ message: "Data dashboard belum tersedia. Pastikan database sudah terkoneksi." }, { status: 503 });
  }
}