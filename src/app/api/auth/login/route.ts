import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { looksLikePhoneNumber, phoneNumberVariants } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: unknown; email?: unknown; password?: unknown };
    const rawIdentifier = typeof body.identifier === "string"
      ? body.identifier
      : typeof body.email === "string"
        ? body.email
        : "";
    const identifier = rawIdentifier.trim();
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return NextResponse.json({ message: "Email/nomor telepon dan password wajib diisi." }, { status: 400 });
    }

    const user = looksLikePhoneNumber(identifier)
      ? await prisma.user.findFirst({ where: { phoneWa: { in: phoneNumberVariants(identifier) } } })
      : await prisma.user.findUnique({ where: { email: identifier.toLowerCase() } });

    if (!user || user.memberStatus !== "AKTIF" || !(await compare(password, user.passwordHash))) {
      return NextResponse.json({ message: "Email/nomor telepon atau password tidak valid." }, { status: 401 });
    }

    const token = await createSession(user);
    const response = NextResponse.json({
      user: { id: user.id, memberId: user.memberId, fullName: user.fullName, role: user.role },
      requiresPasswordChange: user.isDefaultPassword,
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ message: "Layanan login belum dapat digunakan. Pastikan database sudah terhubung." }, { status: 500 });
  }
}
