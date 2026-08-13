import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText } from "@/lib/api";

export async function GET() {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  try { return NextResponse.json({ announcements: await prisma.announcement.findMany({ where: auth.session.role === "ANGGOTA" ? { visibility: "PUBLIC" } : undefined, include: { author: { select: { fullName: true } } }, orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] }) }); }
  catch { return errorResponse("Pengumuman belum tersedia.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const title = safeText(body.title, 150), content = safeText(body.content, 10000);
  if (!title || !content) return errorResponse("Judul dan isi pengumuman wajib diisi.");
  try { return NextResponse.json({ announcement: await prisma.announcement.create({ data: { title, content, isPinned: body.isPinned === true, visibility: body.visibility === "INTERNAL" ? "INTERNAL" : "PUBLIC", authorId: auth.session.userId } }) }, { status: 201 }); }
  catch { return errorResponse("Pengumuman gagal disimpan.", 400); }
}

export async function PATCH(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const id = safeText(body.id, 50);
  if (!id) return errorResponse("ID pengumuman wajib diisi.");

  try {
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) return errorResponse("Pengumuman tidak ditemukan.", 404);

    if (body.action === "TOGGLE_PIN") {
      const updated = await prisma.announcement.update({
        where: { id },
        data: { isPinned: !existing.isPinned }
      });
      return NextResponse.json({ announcement: updated });
    }

    const title = safeText(body.title, 150) || existing.title;
    const content = safeText(body.content, 10000) || existing.content;
    const visibility = body.visibility === "INTERNAL" ? "INTERNAL" : body.visibility === "PUBLIC" ? "PUBLIC" : existing.visibility;
    const isPinned = typeof body.isPinned === "boolean" ? body.isPinned : existing.isPinned;

    const updated = await prisma.announcement.update({
      where: { id },
      data: { title, content, visibility, isPinned }
    });
    return NextResponse.json({ announcement: updated });
  } catch {
    return errorResponse("Pengumuman gagal diperbarui.", 400);
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
  if (!id) return errorResponse("ID pengumuman wajib diisi.");
  try {
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Pengumuman berhasil dihapus." });
  } catch {
    return errorResponse("Pengumuman gagal dihapus.", 400);
  }
}
