import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText } from "@/lib/api";

export async function GET() {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  try { return NextResponse.json({ items: await prisma.inventoryItem.findMany({ include: { borrowings: { include: { borrower: { select: { fullName: true } } }, orderBy: { createdAt: "desc" }, take: 5 } }, orderBy: { itemName: "asc" } }) }); }
  catch { return errorResponse("Data inventaris belum tersedia.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const itemCode = safeText(body.itemCode, 30), itemName = safeText(body.itemName, 100), totalQty = Number(body.totalQty);
  if (!itemCode || !itemName || !Number.isInteger(totalQty) || totalQty < 1) return errorResponse("Kode, nama, dan jumlah barang wajib valid.");
  try { return NextResponse.json({ item: await prisma.inventoryItem.create({ data: { itemCode, itemName, totalQty, availableQty: totalQty, condition: safeText(body.condition, 50) || "Baik" } }) }, { status: 201 }); }
  catch { return errorResponse("Barang gagal disimpan. Kode mungkin sudah digunakan.", 409); }
}
export async function PATCH(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const id = safeText(body.id, 50);
  const itemCode = safeText(body.itemCode, 30);
  const itemName = safeText(body.itemName, 100);
  const totalQty = Number(body.totalQty);
  if (!id || !itemCode || !itemName || !Number.isInteger(totalQty) || totalQty < 1) {
    return errorResponse("Data barang wajib valid.");
  }
  try {
    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) return errorResponse("Barang tidak ditemukan.", 404);
    const diff = totalQty - existing.totalQty;
    const newAvailable = Math.max(0, existing.availableQty + diff);
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        itemCode,
        itemName,
        totalQty,
        availableQty: newAvailable,
        condition: safeText(body.condition, 50) || existing.condition
      }
    });
    return NextResponse.json({ item });
  } catch {
    return errorResponse("Barang gagal diperbarui. Kode mungkin sudah digunakan.", 400);
  }
}

export async function DELETE(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS"]);
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
  if (!id) return errorResponse("ID barang wajib diisi.");
  try {
    await prisma.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Barang berhasil dihapus." });
  } catch {
    return errorResponse("Barang gagal dihapus. Terdapat riwayat peminjaman terkait barang ini.", 400);
  }
}