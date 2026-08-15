"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Megaphone, Users, Wallet, TrendingUp, Clock, ChevronRight, Target, HandCoins } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import FinancialAreaChart from "@/components/charts/FinancialAreaChart";
import FinancialDonutChart from "@/components/charts/FinancialDonutChart";
import ProgramProgress from "@/components/ProgramProgress";

type EventItem = { id: string; title: string; eventDate: string; location: string };
type FinancialPoint = { month: string; income: number; expense: number };
type DonutItem = { name: string; value: number; color: string };
type FinancialSummaryGroup = { sumberKas: string; data: FinancialPoint[] };
type DonutSummaryGroup = { sumberKas: string; data: DonutItem[] };
type DashboardData = {
  stats: { members: number; activeMembers: number; announcements: number; balance: number; pendingLoans: number };
  upcomingEvents: EventItem[];
  financialSummary: FinancialSummaryGroup[];
  donutData: DonutSummaryGroup[];
};
const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 17) return "Selamat Siang";
  if (h < 21) return "Selamat Sore";
  return "Selamat Malam";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [message, setMessage] = useState("");
  const [selectedSource, setSelectedSource] = useState<"ALL" | "INDUK" | "JIMPITAN">("ALL");
  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (r) => { const v = await r.json(); if (!r.ok) throw new Error(v.message); setData(v); })
      .catch((e: Error) => setMessage(e.message));
  }, []);

  const selectedFinancialSummary = useMemo(() => {
    if (!data) return [];
    if (selectedSource === "ALL") return data.financialSummary.flatMap((g) => g.data);
    return data.financialSummary.find((g) => g.sumberKas === selectedSource)?.data || [];
  }, [data, selectedSource]);
  const selectedDonutData = useMemo(() => {
    if (!data) return [];
    if (selectedSource === "ALL") return data.donutData.flatMap((g) => g.data);
    return data.donutData.find((g) => g.sumberKas === selectedSource)?.data || [];
  }, [data, selectedSource]);

  const activePct = data ? Math.round((data.stats.activeMembers / Math.max(data.stats.members, 1)) * 100) : 0;
  const programs = data ? [
    { label: "Keanggotaan Aktif", current: data.stats.activeMembers, total: data.stats.members, color: "#059669" },
    { label: "Target Pengumuman", current: data.stats.announcements, total: Math.max(data.stats.announcements + 5, 10), color: "#3B82F6" },
    { label: "Pinjaman Tertagih", current: Math.max(data.stats.pendingLoans - 2, 0), total: Math.max(data.stats.pendingLoans, 1), color: "#F97316" },
  ] : [];

  return (
    <DashboardShell title="Dashboard Utama">
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#073833] via-[#0F766E] to-[#14B8A6] p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
              &#10024; Karang Taruna Tunas Harapan
            </div>
            <h2 className="text-2xl font-black tracking-tight sm:text-4xl">{getGreeting()}</h2>
            <p className="mt-1 text-base font-semibold text-amber-200">Bersama Bergerak, Bersama Berdampak.</p>
            <p className="mt-1 text-xs sm:text-sm text-teal-50 max-w-xl leading-relaxed">Portal terpadu manajemen pemuda, kegiatan sosial, transparansi kas keuangan, dan koordinasi warga dusun.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/kegiatan/agenda" className="flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-teal-950 shadow-lg hover:bg-amber-300 transition-all"><CalendarDays size={16} /> Buat Kegiatan</Link>
              <Link href="/keuangan/pemasukan" className="flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-2.5 text-xs font-bold text-white border border-white/20 hover:bg-white/25 transition-all"><TrendingUp size={16} /> Lihat Keuangan</Link>
            </div>
          </div>
        </section>

        {message && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{message}</div>}

        {/* Stat Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Anggota" value={data?.stats.members ?? "-"} icon={<Users size={19} />} bgColor="#0F766E" trend={{ value: activePct + "% aktif", isPositive: activePct >= 50 }} />
          <StatCard title="Anggota Aktif" value={data?.stats.activeMembers ?? "-"} icon={<Users size={19} />} bgColor="#059669" trend={{ value: activePct + "% dari total", isPositive: true }} />
          <StatCard title="Saldo Kas" value={data ? money.format(data.stats.balance) : "-"} icon={<Wallet size={19} />} bgColor="#F97316" trend={{ value: data?.stats.pendingLoans ? data.stats.pendingLoans + " pinjaman" : "Aman", isPositive: !data?.stats.pendingLoans }} />
          <StatCard title="Pengumuman" value={data?.stats.announcements ?? "-"} icon={<Megaphone size={19} />} bgColor="#3B82F6" trend={{ value: "Publik", isPositive: true }} />
        </section>

        {/* Charts Row */}
        <section className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div><h3 className="font-bold text-slate-900">Ringkasan Keuangan</h3><p className="text-xs text-slate-500">Trend 6 bulan terakhir</p></div>
              <Link href="/keuangan/pemasukan" className="text-xs font-semibold text-[#0F766E]">Detail <ChevronRight size={14} className="inline" /></Link>
            </div>
            <div className="mb-3 flex items-center gap-2 overflow-x-auto text-xs font-medium">
              {[{ id: "ALL", label: "Gabungan" }, { id: "INDUK", label: "Kas Induk" }, { id: "JIMPITAN", label: "Kas Jimpitan" }].map((tab) => (
                <button key={tab.id} onClick={() => setSelectedSource(tab.id as "ALL" | "INDUK" | "JIMPITAN")} className={`rounded-full px-3 py-1 whitespace-nowrap ${selectedSource === tab.id ? "bg-[#0F766E] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{tab.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-[#059669]" /> Pemasukan</span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-[#F97316]" /> Pengeluaran</span>
            </div>
            {selectedFinancialSummary.length ? <FinancialAreaChart data={selectedFinancialSummary} /> : <div className="flex h-[280px] items-center justify-center text-xs text-slate-400">Memuat grafik...</div>}
          </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4"><h3 className="font-bold text-slate-900">Komposisi Kas</h3><p className="text-xs text-slate-500">Pemasukan vs Pengeluaran</p></div>
            {selectedDonutData.length ? <FinancialDonutChart data={selectedDonutData} /> : <div className="flex h-[190px] items-center justify-center text-xs text-slate-400">Memuat...</div>}
            <div className="mt-3 space-y-2">
              {selectedDonutData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                  <span className="text-xs font-bold text-slate-800">{money.format(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Program + Agenda */}
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F766E]/10 text-[#0F766E]"><Target size={18} /></div>
              <div><h3 className="font-bold text-slate-900">Program Kerja</h3><p className="text-[11px] text-slate-500">Pencapaian tahun ini</p></div>
            </div>
            {programs.length > 0 ? <ProgramProgress programs={programs} /> : <div className="flex h-20 items-center justify-center text-xs text-slate-400">Memuat...</div>}
            <div className="mt-5 rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div className="flex items-center gap-2"><HandCoins size={14} className="text-[#0F766E]" /><p className="text-[11px] font-medium text-slate-600">Pinjaman pending: <span className="font-bold text-[#0F766E]">{data?.stats.pendingLoans ?? 0}</span></p></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Clock size={18} /></div>
                <div><h3 className="font-bold text-slate-900">Agenda Mendatang</h3><p className="text-[11px] text-slate-500">Kegiatan terdekat</p></div>
              </div>
              <Link href="/kegiatan/agenda" className="text-xs font-semibold text-[#0F766E]">Lihat semua &#8594;</Link>
            </div>
            {data?.upcomingEvents?.length ? (
              <div className="space-y-2">
                {data.upcomingEvents.map((event) => {
                  const ed = new Date(event.eventDate);
                  const day = ed.getDate();
                  const ms = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
                  return (
                    <div key={event.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-teal-50/50 transition-colors">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0F766E] text-white">
                        <span className="text-[10px] font-bold leading-none uppercase">{ms[ed.getMonth()]}</span>
                        <span className="text-lg font-black leading-none">{day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{event.title}</p>
                        <p className="text-[11px] text-slate-500">{dateFormat.format(ed)} &#183; {event.location}</p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-slate-300" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-center border border-dashed border-slate-200">
                <CalendarDays size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">Belum ada agenda</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
