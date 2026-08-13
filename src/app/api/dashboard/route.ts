import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized } from "@/lib/api";

export async function GET() {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  try {
    const [members, activeMembers, announcements, income, expense, pendingLoans, upcomingEvents] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { memberStatus: "AKTIF" } }),
      prisma.announcement.count({ where: { visibility: "PUBLIC" } }),
      prisma.cashTransaction.aggregate({ _sum: { amount: true }, where: { type: "INCOME" } }),
      prisma.cashTransaction.aggregate({ _sum: { amount: true }, where: { type: "EXPENSE" } }),
      prisma.financialLoan.count({ where: { status: "PENDING" } }),
      prisma.event.findMany({ where: { eventDate: { gte: new Date() }, ...(auth.session.role === "ANGGOTA" ? { visibility: "PUBLIC" } : {}) }, orderBy: { eventDate: "asc" }, take: 5, select: { id: true, title: true, eventDate: true, location: true } }),
    ]);
    return NextResponse.json({
      stats: { members, activeMembers, announcements, balance: Number(income._sum.amount ?? 0) - Number(expense._sum.amount ?? 0), pendingLoans },
      upcomingEvents,
    });
  } catch (error) {
    console.error("Dashboard error", error);
    return NextResponse.json({ message: "Data dashboard belum tersedia. Pastikan database sudah terkoneksi." }, { status: 503 });
  }
}