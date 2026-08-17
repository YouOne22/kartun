import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import { prisma } from "@/lib/prisma";
import { format, isPast, isToday } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowRight, Bell, CalendarClock, CalendarDays, FileText,
  HeartHandshake, Home, Leaf, MapPin, Megaphone, MessageCircle,
  Package, Sparkles, TrendingUp, Users, Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TUNAS HARAPAN — Karang Taruna Dusun Kemitir",
  description: "Platform digital untuk menghubungkan anggota dan menggerakkan kegiatan Karang Taruna TUNAS HARAPAN Dusun Kemitir.",
};
export const revalidate = 3600;

type KegiatanItem = { id: string; title: string; description: string | null; eventDate: Date; location: string };
const inDays = (n: number) => new Date(Date.now() + n * 86400000);
const FALLBACK: KegiatanItem[] = [
  { id: "fb-1", title: "Gotong Royong Bersih Lingkungan", description: "Kerja bakti bersama warga dan pemuda menjaga kebersihan lingkungan.", eventDate: inDays(14), location: "Dusun Kemitir" },
  { id: "fb-2", title: "Pelatihan Kepemimpinan Pemuda", description: "Pelatihan soft skill dan kepemimpinan untuk pengurus Karang Taruna.", eventDate: inDays(30), location: "Balai Dusun Kemitir" },
  { id: "fb-3", title: "Turnamen Futsal Antar-RW", description: "Ajang olahraga untuk mempererat silaturahmi pemuda se-wilayah.", eventDate: inDays(45), location: "Lapangan Dusun Kemitir" },
];
async function getKegiatan(): Promise<KegiatanItem[]> {
  try { return await prisma.event.findMany({ where: { visibility: "PUBLIC" }, orderBy: { eventDate: "desc" }, take: 3, select: { id: true, title: true, description: true, eventDate: true, location: true } }); }
  catch { return []; }
}
function statusKegiatan(d: Date) {
  if (isToday(d)) return { label: "BERLANGSUNG", cls: "bg-[#FFF4E5] text-[#B45309]" };
  if (isPast(d)) return { label: "SELESAI", cls: "bg-[#EFF3F2] text-[#6B7C76]" };
  return { label: "AKAN DATANG", cls: "bg-[#EAF7F0] text-[#008F68]" };
}
function fmt(d: Date) { return format(d, "EEEE, d MMMM yyyy", { locale: idLocale }); }
const FITUR = [
  { icon: Users, t: "Kelola Anggota", d: "Data anggota lebih terstruktur dan mudah dikelola." },
  { icon: CalendarDays, t: "Kegiatan", d: "Buat, kelola, dan pantau kegiatan Karang Taruna." },
  { icon: Megaphone, t: "Pengumuman", d: "Sampaikan informasi penting kepada anggota." },
  { icon: Wallet, t: "Keuangan", d: "Pantau pemasukan, pengeluaran, dan saldo kas." },
  { icon: Package, t: "Inventaris", d: "Kelola data barang dan inventaris organisasi." },
  { icon: FileText, t: "Laporan", d: "Dokumentasikan kegiatan dan administrasi organisasi." },
];
const SIDEBAR = [
  { icon: Home, l: "Dashboard" }, { icon: Users, l: "Anggota" }, { icon: CalendarDays, l: "Kegiatan" },
  { icon: Wallet, l: "Keuangan" }, { icon: Package, l: "Inventaris" }, { icon: FileText, l: "Laporan" },
  { icon: Megaphone, l: "Pengumuman" }, { icon: MessageCircle, l: "Ruang Warga" },
];
const NILAI = [
  { icon: Sparkles, t: "Ruang Berkarya", d: "Wadah pemuda untuk mengembangkan potensi dan karya." },
  { icon: HeartHandshake, t: "Gotong Royong", d: "Kebersamaan dan solidaritas dalam setiap kegiatan." },
  { icon: Leaf, t: "Manfaat Nyata", d: "Dampak positif yang dirasakan warga dan lingkungan." },
];

export default async function LandingPage() {
  const kegiatan = await getKegiatan();
  const items = kegiatan.length > 0 ? kegiatan : FALLBACK;

  return (
    <div className="min-h-screen bg-white text-[#06251F]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div aria-hidden className="absolute left-8 top-28 hidden h-36 w-36 lg:block" style={{ backgroundImage: "radial-gradient(circle, #008F68 1.5px, transparent 1.5px)", backgroundSize: "18px 18px", opacity: 0.25 }} />
        <div aria-hidden className="absolute right-10 top-20 hidden text-5xl font-bold text-[#008F68]/15 lg:block">+</div>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:min-h-[720px] lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8 lg:pb-0 lg:pt-10">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-[#06251F] sm:text-5xl lg:text-[4rem]">Bersama Bergerak,<br />Bersama Berkarya.</h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#52656B] sm:text-lg">Platform digital untuk menghubungkan anggota dan menggerakkan kegiatan Karang Taruna.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#008F68] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#007A59] hover:shadow-md">Masuk ke Aplikasi <ArrowRight size={18} /></Link>
              <Link href="#kegiatan" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#008F68]/25 bg-white px-6 py-3.5 text-sm font-semibold text-[#008F68] transition-colors hover:bg-[#EAF7F0]"><CalendarClock size={18} /> Lihat Kegiatan</Link>
            </div>
          </div>
          <div className="relative">
            <div aria-hidden className="absolute -right-16 -top-6 h-[300px] w-[300px] rounded-full bg-[#EAF7F0] sm:h-[380px] sm:w-[380px] lg:-right-24 lg:h-[560px] lg:w-[560px]" />
            <div className="relative h-[280px] sm:h-[380px] lg:h-[600px]">
              <Image src="/avatar.png" alt="Ilustrasi anggota Karang Taruna TUNAS HARAPAN" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain object-bottom" />
            </div>
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="scroll-mt-20 bg-[#F7FAF8] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#06251F] sm:text-4xl">Semua yang Dibutuhkan Karang Taruna dalam Satu Aplikasi</h2>
            <p className="mt-4 text-base leading-relaxed text-[#52656B]">Kelola anggota, kegiatan, informasi, dan administrasi organisasi dengan lebih terstruktur.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FITUR.map((f) => (
              <div key={f.t} className="group rounded-2xl border border-[#DCE8E3] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#008F68]/40 hover:shadow-lg hover:shadow-[#008F68]/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF7F0] text-[#008F68] transition-colors group-hover:bg-[#008F68] group-hover:text-white">
                  <f.icon size={24} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#06251F]">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#52656B]">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEGIATAN */}
      <section id="kegiatan" className="scroll-mt-20 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#06251F] sm:text-4xl">Kegiatan Karang Taruna</h2>
            <p className="mt-4 text-base leading-relaxed text-[#52656B]">Lihat kegiatan yang sedang berlangsung dan agenda yang akan datang.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {items.map((k) => {
              const s = statusKegiatan(k.eventDate);
              return (
                <article key={k.id} className="flex flex-col rounded-2xl border border-[#DCE8E3] bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${s.cls}`}>{s.label}</span>
                    <CalendarDays size={20} className="text-[#008F68]" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold leading-snug text-[#06251F]">{k.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#52656B]">{k.description ?? "Agenda resmi Karang Taruna TUNAS HARAPAN."}</p>
                  <div className="mt-auto flex flex-col gap-1.5 pt-6 text-sm text-[#52656B]">
                    <span className="flex items-center gap-2"><CalendarClock size={16} className="text-[#008F68]" />{fmt(k.eventDate)}</span>
                    <span className="flex items-center gap-2"><MapPin size={16} className="text-[#008F68]" />{k.location}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PREVIEW APLIKASI */}
      <section id="aplikasi" className="scroll-mt-20 overflow-hidden bg-[#F7FAF8] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#06251F] sm:text-4xl">Satu Ruang untuk Mengelola Karang Taruna</h2>
            <p className="mt-4 text-base leading-relaxed text-[#52656B]">Dashboard terintegrasi untuk administrasi, keuangan, kegiatan, hingga komunikasi antaranggota.</p>
          </div>
          <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl border border-[#DCE8E3] bg-white shadow-2xl shadow-[#06251F]/10">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-[#E6EFEA] bg-white px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#F97316]/80" />
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]/80" />
              <span className="h-3 w-3 rounded-full bg-[#3B82F6]/80" />
              <div className="ml-3 flex-1 rounded-lg bg-[#F7FAF8] px-3 py-1 text-xs text-[#52656B]">dashboard.tunasharapan.id</div>
            </div>
            <div className="grid lg:grid-cols-[220px_1fr]">
              {/* Sidebar */}
              <aside className="hidden bg-[#06251F] p-4 text-white lg:block">
                <div className="flex items-center gap-2 px-2 pb-4">
                  <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
                  <div><p className="text-sm font-bold">TUNAS HARAPAN</p><p className="text-[10px] text-white/60">Karang Taruna</p></div>
                </div>
                <ul className="space-y-1 text-sm">
                  {SIDEBAR.map((m) => (
                    <li key={m.l}>
                      <span className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${m.l === "Dashboard" ? "bg-[#008F68] font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"}`}><m.icon size={16} />{m.l}</span>
                    </li>
                  ))}
                </ul>
              </aside>
              {/* Main area */}
              <div className="bg-[#F7FAF8] p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#06251F] sm:text-base">Dashboard</h4>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7F0] px-3 py-1 text-[11px] font-semibold text-[#008F68]"><Bell size={13} /> Pengumuman</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: "Anggota Aktif", value: "150", delta: "+12%" },
                    { label: "Saldo Kas", value: "Rp 25,4 jt", delta: "+8%" },
                    { label: "Kegiatan", value: "18", delta: "+5%" },
                    { label: "Laporan", value: "32", delta: "+15%" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-[#DCE8E3] bg-white p-3.5">
                      <p className="text-[11px] font-medium text-[#52656B]">{s.label}</p>
                      <p className="mt-1 text-base font-extrabold text-[#06251F] sm:text-lg">{s.value}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#008F68]"><TrendingUp size={12} /> {s.delta}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
                  {/* Chart */}
                  <div className="rounded-xl border border-[#DCE8E3] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#06251F]">Kas Masuk Bulan Ini</p>
                      <span className="text-xs text-[#52656B]">Rp 3,2 jt</span>
                    </div>
                    <div className="mt-4 flex h-32 items-end gap-2">
                      {[45, 70, 55, 85, 60, 95, 75, 100, 65, 80, 55, 70].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md bg-[#008F68]/80 transition-colors hover:bg-[#008F68]" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2 text-[10px] text-[#52656B]">
                      {["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"].map((b) => (
                        <span key={b} className="flex-1 text-center">{b}</span>
                      ))}
                    </div>
                  </div>
                  {/* Recent */}
                  <div className="rounded-xl border border-[#DCE8E3] bg-white p-4">
                    <p className="text-sm font-bold text-[#06251F]">Kegiatan Terdekat</p>
                    <ul className="mt-3 space-y-3">
                      {items.slice(0, 3).map((k) => (
                        <li key={k.id} className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF7F0] text-[#008F68]"><CalendarDays size={16} /></span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#06251F]">{k.title}</p>
                            <p className="text-xs text-[#52656B]">{fmt(k.eventDate)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="scroll-mt-20 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-[#EAF7F0] rotate-2" />
            <Image src="/logo.png" alt="Logo TUNAS HARAPAN" width={640} height={640} className="relative h-auto w-full rounded-[2rem] bg-white object-contain p-4" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#06251F] sm:text-4xl">Tentang TUNAS HARAPAN</h2>
            <p className="mt-5 text-base leading-relaxed text-[#52656B]">TUNAS HARAPAN adalah Karang Taruna Dusun Kemitir yang menjadi ruang bagi pemuda untuk bergerak, berkarya, berkolaborasi, dan memberikan manfaat bagi lingkungan.</p>
            <ul className="mt-8 space-y-5">
              {NILAI.map((v) => (
                <li key={v.t} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#008F68] text-white"><v.icon size={20} /></span>
                  <div><p className="font-bold text-[#06251F]">{v.t}</p><p className="mt-1 text-sm leading-relaxed text-[#52656B]">{v.d}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA / KONTAK */}
      <section id="kontak" className="scroll-mt-20 bg-white pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#06251F] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div aria-hidden className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-[#008F68]/30 blur-2xl" />
            <div aria-hidden className="absolute -bottom-14 -right-10 h-56 w-56 rounded-full bg-[#39B87A]/20 blur-2xl" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Mari Bergerak Bersama.</h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/70">Bergabung dan kelola aktivitas Karang Taruna melalui satu platform digital.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#06251F] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#EAF7F0]">Masuk ke Aplikasi <ArrowRight size={18} /></Link>
                <Link href="/kritik-saran" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">Kritik &amp; Saran</Link>
              </div>
              <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80"><MapPin size={16} className="text-[#39B87A]" /> Dusun Kemitir</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E6EFEA] bg-[#F7FAF8] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo TUNAS HARAPAN" width={44} height={44} className="h-11 w-11 object-contain" />
              <div><p className="text-sm font-extrabold tracking-tight text-[#06251F]">TUNAS HARAPAN</p><p className="text-[11px] font-semibold tracking-[0.2em] text-[#008F68]">KARANG TARUNA</p></div>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#52656B]">
              <Link href="#fitur" className="hover:text-[#008F68]">Fitur</Link>
              <Link href="#kegiatan" className="hover:text-[#008F68]">Kegiatan</Link>
              <Link href="#tentang" className="hover:text-[#008F68]">Tentang</Link>
              <Link href="/login" className="hover:text-[#008F68]">Masuk</Link>
            </nav>
          </div>
          <p className="mt-8 border-t border-[#DCE8E3] pt-6 text-center text-xs text-[#52656B]">&copy; {new Date().getFullYear()} Karang Taruna TUNAS HARAPAN &middot; Dusun Kemitir. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}

