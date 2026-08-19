import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText, dateOrNull } from "@/lib/api";

export async function GET() {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  try {
    const events = await prisma.event.findMany({
      where: auth.session.role === "ANGGOTA" ? { visibility: "PUBLIC" } : undefined,
      include: { creator: { select: { fullName: true } }, _count: { select: { attendances: true, documentations: true } } },
      orderBy: { eventDate: "desc" },
    });
    return NextResponse.json({ events });
  } catch { return errorResponse("Data kegiatan belum tersedia.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS", "PENGURUS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const title = safeText(body.title, 150), location = safeText(body.location, 100), eventDate = dateOrNull(body.eventDate);
  if (!title || !location || !eventDate) return errorResponse("Judul, lokasi, dan waktu kegiatan wajib valid.");
  try {
    const event = await prisma.event.create({ data: { title, location, eventDate, description: safeText(body.description, 5000) || null, eventQrToken: randomUUID(), visibility: body.visibility === "PUBLIC" ? "PUBLIC" : "INTERNAL", createdBy: auth.session.userId } });
    return NextResponse.json({ event }, { status: 201 });
  } catch { return errorResponse("Kegiatan gagal disimpan.", 400); }
}

export async function PATCH(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS", "PENGURUS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const id = safeText(body.id, 50), title = safeText(body.title, 150), location = safeText(body.location, 100), eventDate = dateOrNull(body.eventDate);
  if (!id || !title || !location || !eventDate) return errorResponse("Data kegiatan wajib lengkap.");
  try { return NextResponse.json({ event: await prisma.event.update({ where: { id }, data: { title, location, eventDate, description: safeText(body.description, 5000) || null, visibility: body.visibility === "PUBLIC" ? "PUBLIC" : "INTERNAL" } }) }); }
  catch { return errorResponse("Kegiatan gagal diperbarui.", 400); }
}
export async function DELETE(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS", "PENGURUS"]);
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
  if (!id) return errorResponse("ID kegiatan wajib diisi.");
  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Kegiatan berhasil dihapus." });
  } catch {
    return errorResponse("Kegiatan gagal dihapus. Kegiatan mungkin memiliki data absensi atau dokumentasi terkait.", 400);
  }
}
