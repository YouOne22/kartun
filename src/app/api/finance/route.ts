import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, positiveAmount, safeText } from "@/lib/api";

export async function GET() {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  try {
    const transactions = await prisma.cashTransaction.findMany({ include: { creator: { select: { fullName: true } } }, orderBy: { transactionDate: "desc" }, take: 100 });
    const income = transactions.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + Number(item.amount), 0);
    const expense = transactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + Number(item.amount), 0);
    return NextResponse.json({ transactions, summary: { income, expense, balance: income - expense } });
  } catch { return errorResponse("Data kas belum tersedia.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized(["KETUA", "BENDAHARA"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const amount = positiveAmount(body.amount), category = safeText(body.category, 50);
  const type = body.type === "EXPENSE" ? "EXPENSE" : body.type === "INCOME" ? "INCOME" : null;
  if (!amount || !category || !type) return errorResponse("Jenis, kategori, dan nominal valid wajib diisi.");
  try { return NextResponse.json({ transaction: await prisma.cashTransaction.create({ data: { type, amount, category, description: safeText(body.description, 1000) || null, createdBy: auth.session.userId } }) }, { status: 201 }); }
  catch { return errorResponse("Transaksi kas gagal disimpan.", 400); }
}

export async function PATCH(request: Request) {
  const auth = await authorized(["KETUA", "BENDAHARA"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const id = safeText(body.id, 50);
  const amount = positiveAmount(body.amount);
  const category = safeText(body.category, 50);
  const type = body.type === "EXPENSE" ? "EXPENSE" : body.type === "INCOME" ? "INCOME" : null;
  if (!id || !amount || !category || !type) return errorResponse("Data transaksi kas wajib lengkap.");

  try {
    const updated = await prisma.cashTransaction.update({
      where: { id },
      data: { type, amount, category, description: safeText(body.description, 1000) || null }
    });
    return NextResponse.json({ transaction: updated });
  } catch {
    return errorResponse("Transaksi kas gagal diperbarui.", 400);
  }
}

export async function DELETE(request: Request) {
  const auth = await authorized(["KETUA", "BENDAHARA"]);
  if ("response" in auth) return auth.response;
  const url = new URL(request.url);
  let id = url.searchParams.get("id");
  if (!id) {
    try {
      const body = await request.json() as { id?: string };
      id = body.id || null;
    } catch {
      // ignore
    }
  }
  if (!id) return errorResponse("ID transaksi wajib diisi.");
  try {
    await prisma.cashTransaction.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Transaksi kas berhasil dihapus." });
  } catch {
    return errorResponse("Transaksi kas gagal dihapus.", 400);
  }
}
