import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A]">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/70 bg-white/85 px-6 py-4 backdrop-blur-[12px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F766E] text-lg font-bold text-white shadow-sm">TH</div>
          <div>
            <h1 className="text-base font-bold leading-tight text-[#0F172A] sm:text-lg">Karang Taruna TUNAS HARAPAN</h1>
            <p className="text-xs text-[#64748B]">Dusun Kemitir</p>
          </div>
        </div>
        <Link href="/login" className="rounded-xl bg-[#0F766E] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#115e59]">Masuk Akun</Link>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-12 text-center">
        <div className="w-full max-w-2xl rounded-[24px] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur-[12px] sm:p-12">
          <span className="mb-4 inline-block rounded-full bg-[#14B8A6]/10 px-3 py-1 text-xs font-semibold text-[#0F766E]">Portal Resmi Warga &amp; Anggota</span>
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">Manajemen Organisasi Karang Taruna TUNAS HARAPAN Dusun Kemitir</h2>
          <p className="mb-8 text-sm leading-relaxed text-[#64748B] sm:text-base">Sistem terintegrasi untuk keanggotaan, keuangan, inventaris, absensi QR, dokumentasi kegiatan, dan pelaporan transparan.</p>
          <Link href="/login" className="inline-block w-full rounded-xl bg-[#0F766E] px-8 py-3 text-center font-medium text-white shadow-md transition-all hover:bg-[#115e59] sm:w-auto">Login Sistem</Link>
        </div>
      </main>
      <footer className="border-t border-white/70 bg-white/50 py-6 text-center text-xs text-[#64748B]">© {new Date().getFullYear()} Karang Taruna &quot;TUNAS HARAPAN&quot; Dusun Kemitir.</footer>
    </div>
  );
}
