"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";

type SessionUser = {
  role: "KETUA" | "SEKRETARIS" | "PENGURUS" | "BENDAHARA" | "ANGGOTA";
};

function redirectForRole(role: SessionUser["role"]) {
  void role;
  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });
      const data = (await res.json()) as {
        message?: string;
        requiresPasswordChange?: boolean;
        user?: SessionUser;
      };
      if (!res.ok) {
        setError(data.message || "Gagal masuk.");
        setLoading(false);
        return;
      }
      if (data.requiresPasswordChange) router.push("/change-password");
      else router.push(redirectForRole(data.user?.role ?? "ANGGOTA"));
    } catch {
      setError("Terjadi kesalahan koneksi server.");
      setLoading(false);
    }
  }

  const features = [
    "Kelola anggota dengan mudah",
    "Pantau dan kelola kegiatan",
    "Komunikasi lebih cepat & terhubung",
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0FDF4] p-4">
      <div className="flex w-full max-w-[1000px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:flex-row">
        {/* Panel kiri: branding */}
        <div className="relative z-0 flex w-full flex-col justify-between overflow-hidden bg-[#F0FDF4] p-6 sm:p-8 lg:w-[480px] lg:shrink-0 xl:w-[520px]">
          {/* Dekorasi lingkaran hijau */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#BBF7D0]/60" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#BBF7D0]/40" />
          <div className="pointer-events-none absolute bottom-40 right-4 h-10 w-10 rounded-full bg-[#86EFAC]/50" />
          <div className="pointer-events-none absolute top-52 right-24 h-6 w-6 rounded-full bg-[#4ADE80]/40" />

          {/* Logo + nama organisasi */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo Tunas Harapan"
                width={52}
                height={52}
                className="rounded-full shadow-md"
                priority
              />
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-wide text-[#15803D]">
                  Karang Taruna
                </p>
                <p className="text-[15px] font-extrabold leading-tight text-[#0F172A]">
                  TUNAS HARAPAN
                </p>
              </div>
            </div>
          </div>

          {/* Judul + deskripsi + fitur */}
          <div className="relative z-10 mt-6 flex-1">
            <h1 className="text-[26px] font-extrabold leading-snug text-[#0F172A]">
              Bersama Bergerak,
              <br />
              Bersama Berkarya.
            </h1>
            <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-[#475569]">
              Platform digital untuk menghubungkan anggota dan menggerakkan
              kegiatan Karang Taruna.
            </p>

            <ul className="mt-5 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#334155]">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[#16A34A]"
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Ilustrasi di bagian bawah */}
          <div className="relative z-10 -mb-8 -mx-8 mt-6">
            <Image
              src="/avatar.png"
              alt="Avatar Karang Taruna"
              width={520}
              height={260}
              className="w-full object-cover"
              priority
            />
          </div>
        </div>

        {/* Panel kanan: form */}
        <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 md:px-12">
          <div className="mx-auto w-full max-w-[340px]">
            <h2 className="text-[22px] font-extrabold text-[#0F172A]">
              Selamat Datang Kembali! 👋
            </h2>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Silakan masuk untuk melanjutkan
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-[#EF4444]/30 bg-[#FEF2F2] p-3 text-xs font-medium text-[#EF4444]">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              {/* Email / HP */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#334155]">
                  Email atau Nomor HP
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukkan email atau nomor HP"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/30"
                  />
                </div>
              </div>

              {/* Kata Sandi */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#334155]">
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
                    <User size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-10 pr-11 text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/30"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Ingat saya + Lupa */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#475569]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#CBD5E1] text-[#16A34A] focus:ring-[#16A34A]"
                  />
                  Ingat saya
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-[#008F68] hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Tombol masuk */}
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#008F68] py-3 text-[14px] font-semibold text-white shadow-md shadow-[#16A34A]/25 hover:bg-[#15803D] focus-visible:ring-[#16A34A]"
              >
                Masuk
                {!loading && <ArrowRight size={18} />}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="whitespace-nowrap text-[12px] text-[#94A3B8]">
                atau masuk dengan
              </span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            {/* OAuth placeholder — skip */}
            <p className="text-center text-[12px] italic text-[#94A3B8]">
              Login sosial media belum tersedia
            </p>

            {/* Daftar */}
            <p className="mt-6 text-center text-[13px] text-[#64748B]">
              Belum punya akun?{" "}
                            <Link
                href={
                  process.env.NEXT_PUBLIC_GFORM_REGISTER_URL ??
                  "https://docs.google.com/forms/d/e/1FAIpQLSfmjLS5032T-arEmvWZLEcdeuVWePsJgKm3PStHiljthanisA/viewform?usp=publish-editor"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#008F68] hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
