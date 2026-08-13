import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { getSession, createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Sesi login tidak ditemukan." }, { status: 401 });

  try {
    const body = (await request.json()) as { newPassword?: unknown };
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password baru minimal 8 karakter." }, { status: 400 });
    }

    const passwordHash = await hash(newPassword, 12);
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash, isDefaultPassword: false },
    });
    const token = await createSession(user);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Change password error", error);
    return NextResponse.json({ message: "Password belum dapat diperbarui." }, { status: 500 });
  }
}
