import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, positiveAmount, safeText } from "@/lib/api";

type CashSourceFilter = "INDUK" | "JIMPITAN";

function getSummary(transactions: { type: string; amount: unknown; sumberKas: string }[]) {
  const calc = (source: string) => {
    const tx = transactions.filter((t) => t.sumberKas === source);
    const income = tx.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);
    const expense = tx.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  };
  return { induk: calc("INDUK"), jimpitan: calc("JIMPITAN"), gabungan: { income: calc("INDUK").income + calc("JIMPITAN").income, expense: calc("INDUK").expense + calc("JIMPITAN").expense, balance: calc("INDUK").balance + calc("JIMPITAN").balance } };
}

export async function GET(request: Request) {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  const url = new URL(request.url);
  const filter = url.searchParams.get("sumberKas") as CashSourceFilter | null;
  try {
    const allTransactions = await prisma.cashTransaction.findMany({ include: { creator: { select: { fullName: true } } }, orderBy: { transactionDate: "desc" } });
    const summary = getSummary(allTransactions);
    const transactions = filter ? allTransactions.filter(t => t.sumberKas === filter) : allTransactions;
    return NextResponse.json({ transactions: transactions.slice(0, 100), summary });
  } catch { return errorResponse("Data kas belum tersedia.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized(["KETUA", "BENDAHARA"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const amount = positiveAmount(body.amount), category = safeText(body.category, 50);
  const type = body.type === "EXPENSE" ? "EXPENSE" : body.type === "INCOME" ? "INCOME" : null;
  const sumberKas = body.sumberKas === "JIMPITAN" ? "JIMPITAN" : body.sumberKas === "INDUK" ? "INDUK" : null;
  if (!amount || !category || !type || !sumberKas) return errorResponse("Jenis, kategori, sumber kas, dan nominal valid wajib diisi.");
  try { return NextResponse.json({ transaction: await prisma.cashTransaction.create({ data: { type, amount, category, sumberKas, description: safeText(body.description, 1000) || null, createdBy: auth.session.userId } }) }, { status: 201 }); }
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
  const sumberKas = body.sumberKas === "JIMPITAN" ? "JIMPITAN" : body.sumberKas === "INDUK" ? "INDUK" : null;
  if (!id || !amount || !category || !type || !sumberKas) return errorResponse("Data transaksi kas wajib lengkap.");

  try {
    const updated = await prisma.cashTransaction.update({
      where: { id },
      data: { type, amount, category, sumberKas, description: safeText(body.description, 1000) || null }
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
