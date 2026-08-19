import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeText, errorResponse } from "@/lib/api";
import { normalizePhoneNumber } from "@/lib/phone";

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const configuredSecret = process.env.GFORM_WEBHOOK_SECRET;
  if (!configuredSecret || safeText(body.secret_key, 500) !== configuredSecret) return errorResponse("Webhook secret tidak valid.", 401);
  const fullName = safeText(body.full_name, 100), email = safeText(body.email, 100).toLowerCase(), phoneWa = normalizePhoneNumber(safeText(body.phone_wa, 20));
  if (!fullName || !email || !phoneWa) return errorResponse("full_name, email, dan phone_wa wajib diisi.");
  const birthDateValue = safeText(body.birth_date, 20);
  const birthDate = birthDateValue ? new Date(birthDateValue) : null;
  if (birthDate && Number.isNaN(birthDate.getTime())) return errorResponse("birth_date tidak valid.");
  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, memberId: true } });
    if (existing) {
      const user = await prisma.user.update({ where: { id: existing.id }, data: { fullName, phoneWa, birthPlace: safeText(body.birth_place, 50) || null, birthDate, rt: safeText(body.rt, 5) || "-", rw: safeText(body.rw, 5) || "-", address: safeText(body.address, 2000) || null, education: safeText(body.education, 30) || null, occupation: safeText(body.occupation, 50) || null } });
      void prisma.auditLog.create({ data: { userId: user.id, action: "GFORM_MEMBER_UPDATED", details: JSON.stringify({ memberId: user.memberId, email }) } }).catch((error) => console.error("Webhook audit log failed", error));
      return NextResponse.json({ message: "Data anggota diperbarui.", memberId: user.memberId });
    }
    const year = new Date().getFullYear();
    const latestMember = await prisma.user.findFirst({
      where: { memberId: { startsWith: `KT-TH-${year}-` } },
      orderBy: { memberId: "desc" },
    });
    let nextSeq = 1;
    if (latestMember?.memberId) {
      const parts = latestMember.memberId.split("-");
      const seqStr = parts[parts.length - 1];
      const seqNum = parseInt(seqStr, 10);
      nextSeq = isNaN(seqNum) ? 1 : seqNum + 1;
    }
    const memberId = `KT-TH-${year}-${String(nextSeq).padStart(3, "0")}`;
    const user = await prisma.user.create({ data: { memberId, fullName, email, passwordHash: await hash(process.env.DEFAULT_PASSWORD || "kartunmaju", 12), isDefaultPassword: true, gender: body.gender === "P" ? "P" : "L", birthPlace: safeText(body.birth_place, 50) || null, birthDate, phoneWa, rt: safeText(body.rt, 5) || "-", rw: safeText(body.rw, 5) || "-", address: safeText(body.address, 2000) || null, education: safeText(body.education, 30) || null, occupation: safeText(body.occupation, 50) || null, qrCodeToken: randomUUID() } });
    void prisma.auditLog.create({ data: { userId: user.id, action: "GFORM_MEMBER_IMPORTED", details: JSON.stringify({ memberId: user.memberId, email }) } }).catch((error) => console.error("Webhook audit log failed", error));
    return NextResponse.json({ message: "Anggota berhasil diimpor.", memberId: user.memberId }, { status: 201 });
  } catch { return errorResponse("Import anggota gagal. Data unik mungkin sudah digunakan.", 409); }
}
