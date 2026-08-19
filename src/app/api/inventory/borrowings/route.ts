import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText, dateOrNull } from "@/lib/api";

export async function GET() {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  try { return NextResponse.json({ borrowings: await prisma.inventoryBorrowing.findMany({ where: auth.session.role === "ANGGOTA" ? { borrowerId: auth.session.userId } : undefined, include: { item: true, borrower: { select: { fullName: true, memberId: true } } }, orderBy: { createdAt: "desc" } }) }); }
  catch { return errorResponse("Data peminjaman inventaris belum tersedia.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const itemId = safeText(body.itemId, 50), qty = Number(body.qty);
  if (!itemId || !Number.isInteger(qty) || qty < 1) return errorResponse("Barang dan jumlah wajib valid.");
  try { return NextResponse.json({ borrowing: await prisma.inventoryBorrowing.create({ data: { itemId, borrowerId: auth.session.userId, qty, returnDate: dateOrNull(body.returnDate), purpose: safeText(body.purpose, 1000) || null } }) }, { status: 201 }); }
  catch { return errorResponse("Pengajuan peminjaman gagal disimpan.", 400); }
}

export async function PATCH(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS", "PENGURUS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const id = safeText(body.id, 50), status = body.status === "APPROVED" || body.status === "REJECTED" ? body.status : null;
  if (!id || !status) return errorResponse("ID dan status wajib valid.");
  try {
    return await prisma.$transaction(async (tx) => {
      const borrowing = await tx.inventoryBorrowing.findUnique({ where: { id } });
      if (!borrowing || borrowing.status !== "PENDING") return errorResponse("Pengajuan tidak ditemukan atau sudah diproses.", 409);
      if (status === "APPROVED") {
        const item = await tx.inventoryItem.findUnique({ where: { id: borrowing.itemId } });
        if (!item || item.availableQty < borrowing.qty) return errorResponse("Stok inventaris tidak mencukupi.", 409);
        await tx.inventoryItem.update({ where: { id: item.id }, data: { availableQty: { decrement: borrowing.qty } } });
      }
      return NextResponse.json({ borrowing: await tx.inventoryBorrowing.update({ where: { id }, data: { status, approvedBy: auth.session.userId } }) });
    });
  } catch { return errorResponse("Status peminjaman gagal diperbarui.", 400); }
}
