"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Megaphone, Users, Wallet } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";

type DashboardData = { stats: { members: number; activeMembers: number; announcements: number; balance: number; pendingLoans: number }; upcomingEvents: { id: string; title: string; eventDate: string; location: string }[] };
const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/dashboard").then(async (response) => { const value = await response.json(); if (!response.ok) throw new Error(value.message); setData(value); }).catch((error: Error) => setMessage(error.message)); }, []);

  return (
    <DashboardShell title="Dashboard Utama">
      <div className="space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-[#0F766E] to-[#115e59] p-6 text-white shadow-lg sm:p-8">
          <p className="mb-2 text-xs font-medium text-teal-100">Portal organisasi Karang Taruna</p>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Selamat datang di TUNAS HARAPAN</h2>
          <p className="mt-2 max-w-2xl text-sm text-teal-50">Kelola anggota, kegiatan, kas, inventaris, dan komunikasi warga dari satu tempat.</p>
        </section>

        {message && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{message}</div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Anggota" value={data?.stats.members ?? "-"} icon={<Users size={19} />} bgColor="#0F766E" />
          <StatCard title="Anggota Aktif" value={data?.stats.activeMembers ?? "-"} icon={<Users size={19} />} bgColor="#0F766E" />
          <StatCard title="Saldo Kas" value={data ? money.format(data.stats.balance) : "-"} icon={<Wallet size={19} />} bgColor="#0F766E" />
          <StatCard title="Pengumuman Publik" value={data?.stats.announcements ?? "-"} icon={<Megaphone size={19} />} bgColor="#0F766E" />
        </section>

        <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Agenda Mendatang</h3>
              <p className="text-xs text-slate-500">Kegiatan publik dan internal terdekat</p>
            </div>
            <Link href="/kegiatan/agenda" className="text-xs font-semibold text-[#0F766E]">Lihat semua</Link>
          </div>
          {data?.upcomingEvents?.length ? (
            <div className="divide-y divide-slate-100">
              {data.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-3">
                  <div className="rounded-xl bg-teal-50 p-2 text-[#0F766E]">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{event.title}</p>
                    <p className="text-xs text-slate-500">{new Date(event.eventDate).toLocaleString("id-ID")} · {event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada agenda mendatang.</p>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
