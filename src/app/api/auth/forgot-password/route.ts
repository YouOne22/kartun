import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, safeText } from "@/lib/api";
import { phoneNumberVariants, looksLikePhoneNumber } from "@/lib/phone";
import { generateOtpCode } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: string };
    const identifier = safeText(body.identifier, 100);

    if (!identifier) {
      return errorResponse("Email atau nomor WhatsApp wajib diisi.");
    }

    const user = looksLikePhoneNumber(identifier)
      ? await prisma.user.findFirst({ where: { phoneWa: { in: phoneNumberVariants(identifier) } } })
      : await prisma.user.findUnique({ where: { email: identifier.toLowerCase() } });

    // Pesan netral selalu dikembalikan demi mencegah user enumeration
    const genericSuccess = NextResponse.json({
      message: "Jika akun terdaftar, kode verifikasi telah dikirim ke email akun.",
    });

    if (!user || !user.email) {
      return genericSuccess;
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // Hapus OTP lama yang belum terpakai untuk identifier ini
    await prisma.passwordResetOtp.deleteMany({
      where: { identifier: user.email.toLowerCase(), used: false },
    });

    await prisma.passwordResetOtp.create({
      data: {
        identifier: user.email.toLowerCase(),
        code,
        expiresAt,
        used: false,
      },
    });

    await sendOtpEmail(user.email, code).catch((err) => {
      console.error("Gagal mengirim email OTP:", err);
    });

    return genericSuccess;
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse("Gagal memproses permintaan reset password.", 500);
  }
}
