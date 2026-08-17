"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, Camera, Copy, FileText, Home, IdCard, LogOut, Menu, MessageCircle, MessageSquare, Package, QrCode, Users, Wallet, X, Bell, Search, Image as ImageIcon, Megaphone, ChevronDown } from "lucide-react";
import { showSuccess } from "@/components/AlertProvider";
import { QRCodeSVG } from "qrcode.react";
import ChatWidget from "@/components/ChatWidget";

export type SessionUser = {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  gender: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  phoneWa: string | null;
  dusun: string | null;
  rt: string | null;
  rw: string | null;
  address: string | null;
  education: string | null;
  occupation: string | null;
  role: "KETUA" | "SEKRETARIS" | "BENDAHARA" | "ANGGOTA";
  memberStatus: string | null;
  isDefaultPassword: boolean;
  avatarUrl: string | null;
  qrCodeToken: string | null;
};

type NavigationItem = { href: string; label: string; icon: typeof Home; roles?: SessionUser["role"][] };
const navigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/keanggotaan/data", label: "Anggota", icon: Users },
  { href: "/keanggotaan/kartu-digital", label: "Kartu Digital", icon: QrCode },
  { href: "/keuangan/pemasukan", label: "Keuangan", icon: Wallet, roles: ["KETUA", "BENDAHARA"] },
  { href: "/keuangan/pinjaman", label: "Pinjaman", icon: Wallet, roles: ["KETUA", "SEKRETARIS", "BENDAHARA"] },
  { href: "/inventaris/data-barang", label: "Inventaris", icon: Package },
  { href: "/kegiatan/agenda", label: "Kegiatan", icon: CalendarDays },
  { href: "/kegiatan/scan-qr", label: "Scan QRCode", icon: Camera },
  { href: "/kegiatan/dokumentasi", label: "Galeri", icon: ImageIcon },
  { href: "/kegiatan/laporan", label: "Laporan", icon: FileText },
  { href: "/informasi/pengumuman", label: "Pengumuman", icon: Megaphone },
  { href: "/kritik-saran", label: "Kritik & Saran", icon: MessageSquare },
  { href: "/kritik-saran/kelola", label: "Kelola Kritik & Saran", icon: MessageSquare, roles: ["KETUA", "SEKRETARIS", "BENDAHARA"] },
  { href: "/ruang-warga", label: "Ruang Warga", icon: MessageCircle },
];

const initials = (value: string) => value.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
const roleLabels: Record<SessionUser["role"], string> = { KETUA: "Ketua Karang Taruna", SEKRETARIS: "Sekretaris Karang Taruna", BENDAHARA: "Bendahara Karang Taruna", ANGGOTA: "Anggota Karang Taruna" };


export function DashboardShell({ children, title }: { children: ReactNode; title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/session").then(async (response) => {
      if (!response.ok) throw new Error("unauthorized");
      const data = await response.json() as { user: SessionUser };
      if (data.user.isDefaultPassword) { router.replace("/change-password"); return; }
      setUser(data.user);
      setLoading(false);
    }).catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/announcements").then(async (r) => {
      if (r.ok) {
        const d = await r.json() as { announcements?: { createdAt: string }[] };
        const last = localStorage.getItem("th_seen_announcements");
        const lastTs = last ? new Date(last).getTime() : 0;
        const unread = (d.announcements ?? []).filter((a) => new Date(a.createdAt).getTime() > lastTs);
        setAnnouncementCount(unread.length);
      }
    }).catch(() => {});
    fetch("/api/chat").then(async (r) => {
      if (r.ok) {
        const d = await r.json() as { messages?: { createdAt: string }[] };
        const last = localStorage.getItem("th_seen_messages");
        const lastTs = last ? new Date(last).getTime() : 0;
        const unread = (d.messages ?? []).filter((m) => new Date(m.createdAt).getTime() > lastTs);
        setChatCount(unread.length);
      }
    }).catch(() => {});
  }, [user]);

  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); }
  async function copyToken() { if (!user?.qrCodeToken) return; await navigator.clipboard.writeText(user.qrCodeToken); await showSuccess("Token QR disalin."); }
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm text-slate-500">Memuat sistem...</div>;
  const visibleNavigation = navigation.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A]">
            {open && <button aria-label="Tutup menu" onClick={() => setOpen(false)} className="fixed inset-0 z-[55] bg-slate-900/30 md:hidden backdrop-blur-sm" />}
      <aside className={`fixed inset-y-0 left-0 z-[60] flex w-[270px] flex-col border-r border-teal-950 bg-[#073833] p-4 transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mb-6 flex items-center justify-between gap-3 px-2 py-1">
            <button type="button" onClick={() => setProfileOpen(true)} className="flex min-w-0 items-center gap-3 text-left group">
              {user?.avatarUrl && !avatarFailed ? <img src={user.avatarUrl} alt={`Foto ${user.fullName}`} onError={() => setAvatarFailed(true)} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#0F766E]" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-sm font-bold text-white ring-2 ring-transparent group-hover:ring-[#0F766E]">{user && initials(user.fullName)}</div>}
              <div className="min-w-0"><p className="truncate text-sm font-bold text-teal-50 group-hover:text-[#0F766E]">{user?.fullName}</p><p className="mt-0.5 text-xs text-teal-300/70">{user && roleLabels[user.role]}</p></div>
            </button>
            <button aria-label="Tutup menu" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-teal-300/70 hover:bg-[#0F766E]/10 md:hidden"><X size={19} /></button>
          </div>
          <nav aria-label="Navigasi utama" className="space-y-1">{visibleNavigation.map((item) => { const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-[#0F766E]/20 font-semibold text-teal-100" : "text-teal-100/60 hover:bg-[#0F766E]/10 hover:text-teal-50"}`}><Icon aria-hidden="true" size={17} strokeWidth={active ? 2.25 : 2} />{item.label}</Link>; })}</nav>
        </div>
        <div className="mt-4 border-t border-teal-900 pt-4"><p className="truncate px-2 text-[11px] text-teal-300/70">ID Anggota: {user?.memberId}</p></div>

      </aside>
      <div className="flex min-w-0 flex-1 flex-col md:pl-[270px]">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><button aria-label="Buka menu" onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"><Menu size={20} /></button><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F766E] font-bold text-white">TH</div><div className="min-w-0"><p className="truncate text-sm font-bold tracking-tight sm:text-base">TUNAS HARAPAN</p><p className="text-[11px] text-slate-500">Dusun Kemitir</p></div></div><h1 className="sr-only">{title}</h1></div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/informasi/pengumuman" aria-label="Notifikasi" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"><Bell size={20} />{announcementCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{announcementCount > 99 ? "99+" : announcementCount}</span>}</Link>
            <Link href="/ruang-warga" aria-label="Pesan" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"><MessageSquare size={20} />{chatCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{chatCount > 99 ? "99+" : chatCount}</span>}</Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6">{children}</main>
      {/* Profil Lengkap Modal */}
      {profileOpen && user && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
                  <IdCard size={22} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Profil Pribadi Pengguna</h2>
                  <p className="text-xs text-slate-500">Informasi detail akun dan kartu identitas digital</p>
                </div>
              </div>
              <button onClick={() => setProfileOpen(false)} aria-label="Tutup modal" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-6 p-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                {user.avatarUrl && !avatarFailed ? (
                  <img src={user.avatarUrl} alt={`Foto ${user.fullName}`} onError={() => setAvatarFailed(true)} className="h-24 w-24 rounded-2xl object-cover shadow-md ring-4 ring-white" />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#0F766E] text-2xl font-bold text-white shadow-md ring-4 ring-white">{initials(user.fullName)}</div>
                )}
                <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{user.fullName}</h3>
                    <span className="rounded-full bg-[#0F766E]/10 px-3 py-0.5 text-xs font-semibold text-[#0F766E]">{roleLabels[user.role]}</span>
                    {user.memberStatus && <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-200">{user.memberStatus}</span>}
                  </div>
                  <p className="text-xs font-medium text-slate-500">ID Anggota: <span className="font-mono font-bold text-slate-700">{user.memberId}</span></p>
                  <p className="text-xs text-slate-500">{user.email || "Email belum diatur"}</p>
                  <p className="text-xs text-slate-500">{user.phoneWa || "No. WhatsApp belum diatur"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div><p className="text-xs font-medium text-slate-400">Jenis Kelamin</p><p className="mt-0.5 text-sm font-semibold text-slate-800">{user.gender === "L" ? "Laki-laki" : user.gender === "P" ? "Perempuan" : "-"}</p></div>
                <div><p className="text-xs font-medium text-slate-400">Tempat, Tanggal Lahir</p><p className="mt-0.5 text-sm font-semibold text-slate-800">{user.birthPlace || "-"}, {user.birthDate ? new Date(user.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</p></div>
                <div className="sm:col-span-2"><p className="text-xs font-medium text-slate-400">Alamat Lengkap</p><p className="mt-0.5 text-sm font-semibold text-slate-800">RT {user.rt || "-"} / RW {user.rw || "-"}, Dusun {user.dusun || "Kemitir"}{user.address ? `, ${user.address}` : ""}</p></div>
                <div><p className="text-xs font-medium text-slate-400">Pendidikan</p><p className="mt-0.5 text-sm font-semibold text-slate-800">{user.education || "-"}</p></div>
                <div><p className="text-xs font-medium text-slate-400">Pekerjaan</p><p className="mt-0.5 text-sm font-semibold text-slate-800">{user.occupation || "-"}</p></div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2"><IdCard size={18} className="text-[#0F766E]" /><h4 className="font-bold text-slate-900">QR Code Absensi</h4></div>
                {user.qrCodeToken ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 shrink-0">
                      <QRCodeSVG
                        value={user.qrCodeToken}
                        size={110}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="space-y-2 w-full min-w-0">
                      <p className="text-xs font-medium text-slate-500">Token String:</p>
                      <code className="block w-full break-all rounded-xl bg-white p-2.5 text-[11px] font-mono text-slate-600 border border-slate-200">{user.qrCodeToken}</code>
                      <button onClick={copyToken} disabled={!user.qrCodeToken} aria-label="Salin QR token" className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#0F766E] hover:bg-teal-50 transition-colors"><Copy size={15} /> Salin Token</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Token belum tersedia</p>
                )}
                <p className="text-xs text-slate-500">Gunakan QR Code atau token QR ini untuk absensi mandiri pada kegiatan Karang Taruna.</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-2xl">
              <button type="button" onClick={() => { setProfileOpen(false); logout(); }} className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"><LogOut size={15} /> Keluar Sistem</button>
              <button type="button" onClick={() => setProfileOpen(false)} className="rounded-xl bg-[#0F766E] px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

