import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  const eventParam = new URL(request.url).searchParams.get("eventId");
  const eventId = eventParam && eventParam !== "general" ? eventParam : null;
  try {
    const messages = await prisma.chatMessage.findMany({ where: { eventId }, include: { sender: { select: { id: true, fullName: true, memberId: true, role: true } } }, orderBy: { createdAt: "asc" }, take: 200 });
    return NextResponse.json({ messages });
  } catch { return errorResponse("Chat belum tersedia. Pastikan migration addendum sudah dijalankan.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const message = safeText(body.message, 2000), rawEventId = safeText(body.eventId, 50);
  if (!message) return errorResponse("Pesan tidak boleh kosong.");
  try {
    const chatMessage = await prisma.chatMessage.create({ data: { message, eventId: rawEventId || null, senderId: auth.session.userId }, include: { sender: { select: { id: true, fullName: true, memberId: true, role: true } } } });
    return NextResponse.json({ message: chatMessage }, { status: 201 });
  } catch { return errorResponse("Pesan gagal dikirim.", 400); }
}
