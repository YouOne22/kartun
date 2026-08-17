import nodemailer from "nodemailer";

export async function sendOtpEmail(toEmail: string, code: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "kartuntunasharapankmtr@gmail.com";
  const pass = process.env.SMTP_PASS;

  if (!host || !pass) {
    console.warn("SMTP_HOST or SMTP_PASS not set. OTP code (dev):", code);
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Karang Taruna Tunas Harapan" <${user}>`,
    to: toEmail,
    subject: "Kode Verifikasi Reset Password",
    text: `Halo,\n\nKode verifikasi untuk mereset password akun Karang Taruna Tunas Harapan Anda adalah: ${code}\n\nKode ini berlaku selama 10 menit.\n\nJika Anda tidak merasa meminta reset password, abaikan pesan ini.`,
    html: `<div style="font-family:sans-serif;padding:20px;color:#0f172a"><h2>Reset Password Karang Taruna Tunas Harapan</h2><p>Kode verifikasi Anda:</p><div style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#0f766e;padding:12px 0">${code}</div><p>Berlaku 10 menit. Jangan berikan kode ini kepada siapapun.</p></div>`,
  });

  return true;
}
