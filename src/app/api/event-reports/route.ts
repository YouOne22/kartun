import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  const eventId = new URL(request.url).searchParams.get("eventId") || "";
  if (!eventId) return errorResponse("ID kegiatan wajib diisi.");
  try {
    const report = await prisma.eventReport.findUnique({ where: { eventId }, include: { event: { include: { creator: { select: { fullName: true } }, attendances: { include: { member: { select: { fullName: true, memberId: true } } } }, documentations: { where: { status: "APPROVED" }, select: { photoUrlHd: true, photoUrlThumb: true, caption: true } } } } } });
    return NextResponse.json({ report });
  } catch { return errorResponse("Laporan belum tersedia.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const eventId = safeText(body.eventId, 50), notlenText = safeText(body.notlenText, 20000);
  if (!eventId || !notlenText) return errorResponse("Kegiatan dan notulen wajib diisi.");
  try { return NextResponse.json({ report: await prisma.eventReport.upsert({ where: { eventId }, create: { eventId, notlenText, createdBy: auth.session.userId }, update: { notlenText, createdBy: auth.session.userId } }) }); }
  catch { return errorResponse("Notulen gagal disimpan.", 400); }
}
