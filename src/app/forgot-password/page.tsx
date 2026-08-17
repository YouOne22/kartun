"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mengirim OTP.");
      } else {
        setMessage(data.message || "Kode OTP telah dikirim.");
        setStep("verify");
      }
    } catch {
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verifikasi OTP gagal.");
      } else {
        setMessage(data.message + " Mengalihkan ke halaman login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md p-8 rounded-[20px] bg-white/85 backdrop-blur-[12px] border border-white/70 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-sm">
            TH
          </div>
          <h1 className="text-xl font-bold text-[#0F172A]">Reset Password</h1>
          <p className="text-xs text-[#64748B] mt-1">
            {step === "request"
              ? "Masukkan email atau nomor WA terdaftar untuk menerima OTP"
              : "Masukkan 6 digit kode OTP yang dikirim ke email Anda"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-[#0F766E]/10 border border-[#0F766E]/30 text-[#0F766E] text-xs font-medium">
            {message}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Email atau Nomor WA</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                placeholder="nama@email.com atau 081234567890"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#115e59] text-white text-sm font-medium shadow-md transition-all disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Kirim Kode OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Kode OTP (6 Digit)</label>
              <input
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-center tracking-[8px] font-mono text-lg font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#115e59] text-white text-sm font-medium shadow-md transition-all disabled:opacity-50"
            >
              {loading ? "Verifikasi..." : "Verifikasi OTP & Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => setStep("request")}
              className="w-full text-center text-xs text-[#64748B] hover:text-[#0F172A]"
            >
              Kirim ulang kode / ubah email
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-[#64748B]">
          Ingat password Anda?{" "}
          <Link href="/login" className="font-semibold text-[#0F766E] hover:underline">
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
