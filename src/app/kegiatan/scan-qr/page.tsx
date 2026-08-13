"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CheckCircle2, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { showError, showSuccess } from "@/components/AlertProvider";

type EventItem = { id: string; title: string; eventQrToken: string; eventDate: string };
function ScanQrContent() {
  const searchParams = useSearchParams();
  const scanner = useRef<Html5Qrcode | null>(null);
  const mode = searchParams.get("mode") === "admin" ? "ADMIN_SCAN" : "SELF_SCAN";
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [result, setResult] = useState("");
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Arahkan kamera ke QR kegiatan.");

  useEffect(() => { if (mode !== "ADMIN_SCAN") return; fetch("/api/events").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); setEvents(data.events); if (data.events[0]) setEventId(data.events[0].id); }).catch((error: Error) => void showError(error.message)); }, [mode]);
  useEffect(() => () => { if (scanner.current) { void scanner.current.stop().catch(() => undefined); scanner.current.clear(); } }, []);

  async function submitToken(token: string) {
    const selectedEvent = events.find((event) => event.id === eventId);
    const body = mode === "SELF_SCAN" ? { eventToken: token, scanMethod: "SELF_SCAN" } : { eventToken: selectedEvent?.eventQrToken, memberToken: token, scanMethod: "ADMIN_SCAN" };
    if (mode === "ADMIN_SCAN" && !selectedEvent) return showError("Pilih kegiatan terlebih dahulu.");
    const response = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) return showError(data.message);
    setResult(data.message); setMessage("Scan berhasil. Kamera siap untuk scan berikutnya."); await showSuccess(data.message);
  }

  async function startScanner() {
    if (running) return;
    const instance = new Html5Qrcode("qr-reader"); scanner.current = instance;
    try { await instance.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, async (decodedText) => { await instance.stop(); setRunning(false); await submitToken(decodedText); }, () => undefined); setRunning(true); setMessage("Kamera aktif. Pindai QR sekarang."); }
    catch { setRunning(false); setMessage("Kamera tidak dapat diakses. Pastikan izin kamera diberikan dan gunakan HTTPS."); }
  }

  async function stopScanner() { if (!scanner.current) return; await scanner.current.stop().catch(() => undefined); scanner.current.clear(); scanner.current = null; setRunning(false); setMessage("Kamera dihentikan."); }
  return <DashboardShell title="Scan Absensi QR"><div className="mx-auto max-w-2xl space-y-5"><div><h2 className="text-xl font-bold">Scan Absensi QR</h2><p className="text-sm text-slate-500">Mode self scan membaca QR kegiatan; mode admin membaca QR kartu anggota.</p></div><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => { void stopScanner(); window.history.replaceState(null, "", "/kegiatan/scan-qr?mode=self"); window.dispatchEvent(new PopStateEvent("popstate")); }} className={`rounded-2xl border p-4 text-left ${mode === "SELF_SCAN" ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white"}`}><Camera size={19} className="mb-2 text-[#0F766E]" /><p className="font-semibold">Self Scan</p><p className="text-xs text-slate-500">Anggota memindai QR kegiatan.</p></button><button onClick={() => { void stopScanner(); window.history.replaceState(null, "", "/kegiatan/scan-qr?mode=admin"); window.dispatchEvent(new PopStateEvent("popstate")); }} className={`rounded-2xl border p-4 text-left ${mode === "ADMIN_SCAN" ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white"}`}><ShieldCheck size={19} className="mb-2 text-[#0F766E]" /><p className="font-semibold">Admin Scan</p><p className="text-xs text-slate-500">Pengurus memindai QR anggota.</p></button></div>{mode === "ADMIN_SCAN" && <select value={eventId} onChange={(event) => setEventId(event.target.value)} className="field"><option value="">Pilih kegiatan untuk absensi</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title} · {new Date(event.eventDate).toLocaleDateString("id-ID")}</option>)}</select>}<section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm"><div id="qr-reader" className="mx-auto min-h-64 max-w-md overflow-hidden rounded-2xl bg-slate-950" /><p className="mt-4 text-center text-sm text-slate-500">{message}</p><div className="mt-4 flex justify-center gap-3"><button onClick={() => void startScanner()} disabled={running || (mode === "ADMIN_SCAN" && !eventId)} className="rounded-xl bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Mulai Kamera</button>{running && <button onClick={() => void stopScanner()} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">Hentikan</button>}</div></section>{result && <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 size={18} />{result}</div>}</div></DashboardShell>;
}

export default function ScanQrPage() { return <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Memuat scanner...</div>}><ScanQrContent /></Suspense>; }
