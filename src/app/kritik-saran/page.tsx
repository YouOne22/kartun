"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Send, AlertCircle, CheckCircle, UserCircle, Shield } from "lucide-react";
import { showSuccess, showError } from "@/components/AlertProvider";
import { DashboardShell, type SessionUser } from "@/components/DashboardShell";

const ADMIN_ROLES: SessionUser["role"][] = ["KETUA", "SEKRETARIS", "BENDAHARA"];

export default function KritikSaranPage() {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const isAdmin = !!(user && ADMIN_ROLES.includes(user.role));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showError("Isi kritik dan saran tidak boleh kosong");
      return;
    }
    if (content.length > 2000) {
      showError("Maksimal 2000 karakter");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), isAnonymous }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim");

      showSuccess("Kritik dan saran berhasil dikirim");
      setContent("");
      setCharCount(0);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setCharCount(val.length);
  };

  return (
    <DashboardShell title="Kritik & Saran">
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kritik & Saran</h1>
          <p className="mt-1 text-slate-500">
            Salam sejahtera warga Dusun Kemitir. Silakan sampaikan kritik, saran, atau masukan Anda untuk kemajuan Karang Taruna "Tunas Harapan".
            Pengiriman bisa secara <strong className="text-slate-700">anonim</strong> maupun dengan identitas.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/kritik-saran/kelola"
            className="flex shrink-0 items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-semibold text-[#0F766E] hover:bg-teal-100 transition-colors"
          >
            <Shield size={16} />
            Kelola Kritik & Saran
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-2">
            Isi Kritik / Saran <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="content"
              value={content}
              onChange={handleChange}
              rows={8}
              maxLength={2000}
              placeholder="Tulis kritik, saran, atau masukan Anda di sini..."
              className="field resize-none"
              disabled={isSubmitting}
            />
            <div className="absolute bottom-2 right-2 text-xs text-slate-400">
              {charCount} / 2000
            </div>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Maksimal 2000 karakter. Jangan sertakan informasi pribadi sensitif (NIK, nomor rekening, kata sandi, dll).
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#059669] focus:ring-2 focus:ring-[#059669]/20"
          />
          <label htmlFor="anonymous" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-slate-400" />
              <span className="font-medium text-slate-700">Kirim sebagai Anonim</span>
            </div>
            <p className="mt-1 ml-7 text-xs text-slate-500">
              Identitas Anda (nama, ID anggota) tidak akan tercatat. Pengurus hanya melihat isi pesan tanpa mengetahui pengirim.
            </p>
          </label>
          {isAnonymous && (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#059669] px-6 py-3 text-sm font-semibold text-white hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Mengirim...
            </>
          ) : (
            <>
              <Send size={18} />
              Kirim Kritik & Saran
            </>
          )}
        </button>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-[#059669] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700">Apa yang bisa dikirim?</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-slate-600">
                <li>Kritik terhadap program/kegiatan Karang Taruna</li>
                <li>Saran perbaikan fasilitas/layanan</li>
                <li>Masukan ide kegiatan baru</li>
                <li>Laporan kondisi lingkungan/umum</li>
              </ul>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-[#059669] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700">Proses penanganan</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-slate-600">
                <li>Semua masukkan dibaca langsung oleh pengurus (Ketua, Sekretaris, Bendahara)</li>
                <li>Kritik/saran akan ditindaklanjuti sesuai prioritas</li>
                <li>Balasan tidak dikirim individual, namun hasilnya tercermin dalam program kegiatan</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
    </DashboardShell>
  );
}