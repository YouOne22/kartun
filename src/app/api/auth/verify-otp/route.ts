import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, safeText } from "@/lib/api";
import { hash } from "bcryptjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: string; code?: string };
    const identifier = safeText(body.identifier, 100).toLowerCase();
    const code = safeText(body.code, 10);

    if (!identifier || !code) {
      return errorResponse("Email/No. WA dan kode OTP wajib diisi.");
    }

    // Cari user berdasarkan email atau phoneWa
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phoneWa: identifier },
        ],
      },
    });

    if (!user || !user.email) {
      return errorResponse("Kode OTP tidak valid atau sudah kedaluwarsa.");
    }

    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        identifier: user.email.toLowerCase(),
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return errorResponse("Kode OTP salah atau sudah kedaluwarsa.");
    }

    // Tandai OTP terpakai
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Reset password ke default dan set isDefaultPassword = true
    const defaultPassword = process.env.DEFAULT_PASSWORD || "kartunmaju";
    const passwordHash = await hash(defaultPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isDefaultPassword: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_VIA_OTP",
        details: JSON.stringify({ email: user.email }),
      },
    }).catch(() => undefined);

    return NextResponse.json({
      message: "Password berhasil direset ke default. Silakan login.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponse("Gagal memverifikasi OTP.", 500);
  }
}
