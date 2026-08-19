import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, positiveAmount, safeText, dateOrNull } from "@/lib/api";

export async function GET() {
  const auth = await authorized(["KETUA", "SEKRETARIS", "PENGURUS", "BENDAHARA"]);
  if ("response" in auth) return auth.response;
  try { return NextResponse.json({ loans: await prisma.financialLoan.findMany({ include: { borrower: { select: { fullName: true, memberId: true } }, approver: { select: { fullName: true } }, payments: true }, orderBy: { createdAt: "desc" } }) }); }
  catch { return errorResponse("Data pinjaman belum tersedia.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS", "PENGURUS", "BENDAHARA"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const amount = positiveAmount(body.amount);
  if (!amount) return errorResponse("Nominal pinjaman wajib valid.");
  const borrowerId = safeText(body.borrowerId, 50) || auth.session.userId;
  try { return NextResponse.json({ loan: await prisma.financialLoan.create({ data: { borrowerId, amount, dueDate: dateOrNull(body.dueDate), notes: safeText(body.notes, 1000) || null } }) }, { status: 201 }); }
  catch { return errorResponse("Pengajuan pinjaman gagal disimpan.", 400); }
}

export async function DELETE(request: Request) {
  const auth = await authorized(["KETUA", "BENDAHARA"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const paymentId = safeText(body.paymentId, 50);
  if (!paymentId) return errorResponse("ID pembayaran wajib valid.", 400);
  const loanId = safeText(body.loanId, 50);
  if (!loanId) return errorResponse("ID pinjaman wajib valid.", 400);
  try {
    await prisma.loanPayment.delete({ where: { id: paymentId } });
    return NextResponse.json({ success: true, message: "Pembayaran berhasil dihapus." });
  } catch {
    return errorResponse("Gagal menghapus pembayaran.", 400);
  }
}

export async function PATCH(request: Request) {
  const auth = await authorized(["KETUA", "BENDAHARA"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const id = safeText(body.id, 50);
  if (!id) return errorResponse("ID pinjaman wajib valid.");

  // Pembayaran cicilan / pelunasan sebagian
  if (body.action === "PAY") {
    const amount = positiveAmount(body.amount);
    if (!amount) return errorResponse("Nominal pembayaran wajib valid.");
    const loan = await prisma.financialLoan.findUnique({
      where: { id },
      include: { payments: { select: { amount: true } } },
    });
    if (!loan) return errorResponse("Pinjaman tidak ditemukan.", 404);
    if (loan.isSettled) return errorResponse("Pinjaman sudah lunas.", 400);
    if (loan.status !== "APPROVED") return errorResponse("Hanya pinjaman yang disetujui yang dapat dibayar.", 400);

    const paidSoFar = loan.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = Number(loan.amount) - paidSoFar;
    if (amount > remaining) return errorResponse(`Nominal melebihi sisa pinjaman (Rp ${Number(remaining).toLocaleString("id-ID")}).`, 400);

    try {
      const payment = await prisma.loanPayment.create({
        data: { loanId: loan.id, amount, notes: safeText(body.notes, 500) || null },
      });
      const newPaid = paidSoFar + amount;
      if (newPaid >= Number(loan.amount)) {
        await prisma.financialLoan.update({
          where: { id },
          data: { isSettled: true, settledAt: new Date() },
        });
      }
      return NextResponse.json({ payment, partiallySettled: newPaid >= Number(loan.amount) });
    } catch {
      return errorResponse("Pembayaran gagal dicatat.", 400);
    }
  }

  // Pelunasan penuh: isSettled = true
  if (body.action === "SETTLE") {
    try {
      await prisma.financialLoan.update({ where: { id }, data: { isSettled: true, settledAt: new Date() } });
      return NextResponse.json({ success: true, message: "Pinjaman berhasil ditandai lunas." });
    } catch {
      return errorResponse("Gagal menandai pinjaman sebagai lunas.", 400);
    }
  }

  // Approve / Reject
  const status = body.status === "APPROVED" || body.status === "REJECTED" ? body.status : null;
  if (!status) return errorResponse("Aksi tidak valid.");
  try { return NextResponse.json({ loan: await prisma.financialLoan.update({ where: { id }, data: { status, approvedBy: auth.session.userId } }) }); }
  catch { return errorResponse("Status pinjaman gagal diperbarui.", 400); }
}

