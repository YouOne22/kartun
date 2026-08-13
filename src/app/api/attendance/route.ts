import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  const eventId = new URL(request.url).searchParams.get("eventId") || "";
  if (!eventId) return errorResponse("ID kegiatan wajib diisi.");
  try { return NextResponse.json({ attendances: await prisma.eventAttendance.findMany({ where: { eventId }, include: { member: { select: { fullName: true, memberId: true, avatarUrl: true } } }, orderBy: { scannedAt: "desc" } }) }); }
  catch { return errorResponse("Data absensi belum tersedia.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const eventToken = safeText(body.eventToken, 255), memberToken = safeText(body.memberToken, 255);
  const requestedMethod = body.scanMethod === "ADMIN_SCAN" ? "ADMIN_SCAN" : "SELF_SCAN";
  if (!eventToken) return errorResponse("QR kegiatan wajib dipindai.");
  if (requestedMethod === "ADMIN_SCAN" && !["KETUA", "SEKRETARIS"].includes(auth.session.role)) return errorResponse("Mode scan admin hanya untuk Ketua atau Sekretaris.", 403);
  try {
    const event = await prisma.event.findUnique({ where: { eventQrToken: eventToken }, select: { id: true, eventDate: true } });
    if (!event) return errorResponse("QR kegiatan tidak valid.", 404);
    const member = requestedMethod === "ADMIN_SCAN"
      ? await prisma.user.findUnique({ where: { qrCodeToken: memberToken }, select: { id: true, fullName: true, memberId: true } })
      : await prisma.user.findUnique({ where: { id: auth.session.userId }, select: { id: true, fullName: true, memberId: true } });
    if (!member) return errorResponse("QR anggota tidak valid.", 404);
    const attendance = await prisma.eventAttendance.create({ data: { eventId: event.id, memberId: member.id, scanMethod: requestedMethod }, include: { member: { select: { fullName: true, memberId: true } } } });
    return NextResponse.json({ message: `${member.fullName} berhasil dicatat hadir.`, attendance }, { status: 201 });
  } catch (error) {
    const isDuplicate = error instanceof Error && error.message.includes("Unique constraint");
    return errorResponse(isDuplicate ? "Anggota sudah tercatat hadir pada kegiatan ini." : "Absensi gagal disimpan.", isDuplicate ? 409 : 400);
  }
}