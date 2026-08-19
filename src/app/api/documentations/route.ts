import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText } from "@/lib/api";

export const runtime = "nodejs";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET() {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  try {
    const documentations = await prisma.eventDocumentation.findMany({
      where: auth.session.role === "ANGGOTA" ? { OR: [{ status: "APPROVED" }, { uploaderId: auth.session.userId }] } : undefined,
      include: { event: { select: { id: true, title: true, eventDate: true } }, uploader: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ documentations });
  } catch {
    return errorResponse("Dokumentasi belum tersedia.", 503);
  }
}

export async function POST(request: Request) {
  const auth = await authorized();
  if ("response" in auth) return auth.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Format data dokumentasi tidak valid.");
  }

  const eventId = safeText(formData.get("eventId"), 50);
  const caption = safeText(formData.get("caption"), 500);
  const photo = formData.get("photo");
  if (!eventId || !(photo instanceof File) || photo.size === 0) return errorResponse("Kegiatan dan foto wajib diisi.");
  if (!allowedPhotoTypes.has(photo.type) || photo.size > MAX_PHOTO_SIZE) return errorResponse("Foto harus berupa JPG, PNG, WebP, atau GIF maksimal 5 MB.");

  const baseFilename = randomUUID();

  try {
    const source = Buffer.from(await photo.arrayBuffer());
    const [hdBuffer, thumbBuffer] = await Promise.all([
      sharp(source).rotate().resize({ width: 2048, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
      sharp(source).rotate().resize({ width: 300, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
    ]);

    // Unggah langsung ke Vercel Blob Cloud Storage
    const [hdBlob, thumbBlob] = await Promise.all([
      put(`documentations/${baseFilename}-hd.webp`, hdBuffer, { access: "public" }),
      put(`documentations/${baseFilename}-thumb.webp`, thumbBuffer, { access: "public" }),
    ]);

    const documentation = await prisma.eventDocumentation.create({
      data: {
        eventId,
        uploaderId: auth.session.userId,
        photoUrlHd: hdBlob.url,
        photoUrlThumb: thumbBlob.url,
        caption: caption || null,
      },
    });
    return NextResponse.json({ documentation }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("Dokumentasi gagal diunggah.", 400);
  }
}

export async function PATCH(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS", "PENGURUS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const id = safeText(body.id, 50), status = body.status === "APPROVED" || body.status === "REJECTED" ? body.status : null;
  const rejectionReason = safeText(body.rejectionReason, 1000);
  if (!id || !status || (status === "REJECTED" && !rejectionReason)) return errorResponse("Status dan alasan penolakan wajib valid.");
  try {
    return NextResponse.json({
      documentation: await prisma.eventDocumentation.update({
        where: { id },
        data: { status, rejectionReason: status === "REJECTED" ? rejectionReason : null, approvedBy: auth.session.userId }
      })
    });
  } catch {
    return errorResponse("Moderasi dokumentasi gagal diproses.", 400);
  }
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
  if (!id) return errorResponse("ID dokumentasi wajib diisi.");
  try {
    const existing = await prisma.eventDocumentation.findUnique({ where: { id } });
    if (!existing) return errorResponse("Dokumentasi tidak ditemukan.", 404);

    await prisma.eventDocumentation.delete({ where: { id } });

    // Hapus file dari Vercel Blob Storage
    const deletePromises = [];
    if (existing.photoUrlHd) deletePromises.push(del(existing.photoUrlHd));
    if (existing.photoUrlThumb) deletePromises.push(del(existing.photoUrlThumb));
    await Promise.allSettled(deletePromises);

    return NextResponse.json({ success: true, message: "Dokumentasi berhasil dihapus." });
  } catch {
    return errorResponse("Dokumentasi gagal dihapus.", 400);
  }
}
