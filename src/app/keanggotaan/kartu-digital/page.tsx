"use client";

import { useEffect, useRef, useState } from "react";
import { Download, QrCode, ShieldCheck, User as UserIcon } from "lucide-react";
import { DashboardShell, type SessionUser } from "@/components/DashboardShell";
import { showError, showSuccess } from "@/components/AlertProvider";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";

export default function DigitalCardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal memuat sesi");
        const data = await res.json() as { user: SessionUser };
        setUser(data.user);
        setLoading(false);
      })
      .catch((err: Error) => {
        setLoading(false);
        void showError(err.message || "Gagal memuat sesi pengguna");
      });
  }, []);

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `kartu-anggota-${user?.memberId || "tunas-harapan"}.png`;
      link.click();
      await showSuccess("Kartu digital berhasil diunduh.");
    } catch {
      await showError("Gagal mengunduh kartu digital.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell title="Kartu Digital">
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          Memuat kartu digital...
        </div>
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell title="Kartu Digital">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">Sesi pengguna tidak ditemukan.</p>
        </div>
      </DashboardShell>
    );
  }

  const roleLabels: Record<SessionUser["role"], string> = {
        KETUA: "Ketua",
    SEKRETARIS: "Sekretaris",
    PENGURUS: "Pengurus",
    BENDAHARA: "Bendahara",
    ANGGOTA: "Anggota",
  };
  return (
    <DashboardShell title="Kartu Digital">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Kartu Anggota Digital</h2>
            <p className="text-sm text-slate-500">Kartu identitas resmi anggota Karang Taruna Tunas Harapan.</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            {downloading ? "Mengunduh..." : "Unduh Kartu (PNG)"}
          </button>
        </div>

        {/* Card Preview Container */}
        <div className="flex justify-center overflow-x-auto py-4">
          <div
            ref={cardRef}
            className="w-[380px] sm:w-[420px] rounded-3xl bg-gradient-to-br from-[#0F766E] via-[#0D5E57] to-[#08423D] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between p-7 select-none border border-teal-600/30"
            style={{ aspectRatio: "1.58 / 1" }}
          >
            {/* Background Decorative Elements */}
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between relative z-10 border-b border-white/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                  <ShieldCheck size={18} className="text-teal-200" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold tracking-wider uppercase text-teal-100">Karang Taruna</h3>
                  <p className="text-[10px] font-medium tracking-wide text-teal-200/80">TUNAS HARAPAN · DUSUN KEMITIR</p>
                </div>
              </div>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-teal-100 backdrop-blur-md border border-white/20">
                {roleLabels[user.role]}
              </span>
            </div>

            {/* Card Body */}
            <div className="flex items-center gap-5 my-auto relative z-10 py-2">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/30 shadow-inner flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img crossOrigin="anonymous" src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={32} className="text-teal-200/70" />
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div>
                  <h4 className="font-bold text-base truncate leading-snug text-white">{user.fullName}</h4>
                  <p className="text-xs font-mono font-medium text-teal-200/90">{user.memberId}</p>
                </div>
                <div className="pt-1 text-[11px] text-teal-100/80 space-y-0.5">
                  <p className="truncate">Dusun {user.dusun || "Kemitir"} {user.rt ? `· RT ${user.rt}` : ""} {user.rw ? `/ RW ${user.rw}` : ""}</p>
                  <p className="font-semibold text-teal-200">{user.memberStatus || "AKTIF"}</p>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/15 relative z-10">
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase tracking-wider text-teal-200/70 font-semibold">Token Absensi QR</p>
                <p className="text-[10px] font-mono font-bold tracking-tight text-white">{user.qrCodeToken ? `${user.qrCodeToken.slice(0, 16)}...` : "TOKEN-PENDING"}</p>
              </div>
              <div className="bg-white p-1.5 rounded-xl shadow-md">
                <QRCodeSVG
                  value={user.qrCodeToken || user.memberId}
                  size={46}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 text-xs text-slate-500">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5"><QrCode size={15} className="text-[#0F766E]" /> Informasi Penggunaan Kartu:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Kartu digital ini sah sebagai identitas keanggotaan Karang Taruna Tunas Harapan Dusun Kemitir.</li>
            <li>QR Code pada kartu dapat digunakan untuk absensi mandiri pada setiap kegiatan atau agenda resmi.</li>
            <li>Anda dapat mengunduh kartu ini ke perangkat Anda untuk disimpan atau dicetak sewaktu-waktu.</li>
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
