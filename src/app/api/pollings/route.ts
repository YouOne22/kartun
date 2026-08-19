import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText } from "@/lib/api";

export async function GET() {
  const auth = await authorized();
  if ("response" in auth) return auth.response;
  try {
    const pollings = await prisma.polling.findMany({ include: { options: { include: { _count: { select: { votes: true } } } }, votes: { where: { voterId: auth.session.userId }, select: { optionId: true } }, creator: { select: { fullName: true } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ pollings: pollings.map((poll) => ({ ...poll, hasVoted: poll.votes.length > 0, votedOptionId: poll.votes[0]?.optionId ?? null })) });
  } catch { return errorResponse("Polling belum tersedia. Pastikan migration addendum sudah dijalankan.", 503); }
}

export async function POST(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS", "PENGURUS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const title = safeText(body.title, 150), description = safeText(body.description, 2000) || null;
  const options = Array.isArray(body.options) ? body.options.map((option) => safeText(option, 100)).filter(Boolean).slice(0, 10) : [];
  if (!title || options.length < 2) return errorResponse("Judul dan minimal dua opsi polling wajib diisi.");
  try { return NextResponse.json({ polling: await prisma.polling.create({ data: { title, description, createdBy: auth.session.userId, options: { create: options.map((optionText) => ({ optionText })) } }, include: { options: true } }) }, { status: 201 }); }
  catch { return errorResponse("Polling gagal dibuat.", 400); }
}

export async function PATCH(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS", "PENGURUS"]);
  if ("response" in auth) return auth.response;
  const body = await request.json() as Record<string, unknown>;
  const pollingId = safeText(body.pollingId, 50);
  const action = safeText(body.action, 20); // "CLOSE" or "DELETE"
  
  if (!pollingId) return errorResponse("ID Polling tidak valid.");
  
  if (action === "CLOSE") {
    try {
      const updated = await prisma.polling.update({ where: { id: pollingId }, data: { isActive: false } });
      return NextResponse.json({ polling: updated });
    } catch {
      return errorResponse("Gagal menutup polling.", 400);
    }
  }

  if (action === "DELETE") {
    try {
      await prisma.polling.delete({ where: { id: pollingId } });
      return NextResponse.json({ success: true });
    } catch {
      return errorResponse("Gagal menghapus polling.", 400);
    }
  }

  // Default: vote action for normal members/officers
  const optionId = safeText(body.optionId, 50);
  if (!optionId) return errorResponse("Polling dan pilihan wajib dipilih.");
  try {
    const polling = await prisma.polling.findUnique({ where: { id: pollingId }, select: { isActive: true } });
    const option = await prisma.pollingOption.findFirst({ where: { id: optionId, pollingId } });
    if (!polling || !polling.isActive || !option) return errorResponse("Polling atau pilihan tidak valid.", 404);
    const vote = await prisma.pollingVote.create({ data: { pollingId, optionId, voterId: auth.session.userId } });
    return NextResponse.json({ vote }, { status: 201 });
  } catch { return errorResponse("Anda sudah memberikan suara pada polling ini.", 409); }
}


