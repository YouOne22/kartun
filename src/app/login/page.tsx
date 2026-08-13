"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal masuk.");
        setLoading(false);
        return;
      }

      if (data.requiresPasswordChange) {
        router.push("/change-password");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan koneksi server.");
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
          <h1 className="text-xl font-bold text-[#0F172A]">Karang Taruna TUNAS HARAPAN</h1>
          <p className="text-xs text-[#64748B] mt-1">Silakan masuk dengan akun terdaftar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">Email atau Nomor Telepon</label>
            <input
              type="text"
              inputMode="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              placeholder="nama@email.com atau 081234567890"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#115e59] text-white text-sm font-medium shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-[#64748B]">
          Lupa password? Hubungi Sekretaris Karang Taruna Dusun Kemitir.
        </div>
      </div>
    </div>
  );
}
