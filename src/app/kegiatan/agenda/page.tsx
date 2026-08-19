"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Download, MapPin, Plus, Printer, QrCode, Pencil, Trash2 } from "lucide-react";
import { DashboardShell, type SessionUser } from "@/components/DashboardShell";
import { confirmAction, showError, showSuccess } from "@/components/AlertProvider";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string;
  visibility: string;
  eventQrToken: string;
  _count: { attendances: number; documentations: number };
};

export default function AgendaPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQrEvent, setSelectedQrEvent] = useState<EventItem | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", eventDate: "", location: "", description: "", visibility: "PUBLIC" });
  const qrCardRef = useRef<HTMLDivElement>(null);

  async function load() {
    const response = await fetch("/api/events");
    const data = await response.json();
    if (response.ok) setEvents(data.events);
    else showError(data.message);
  }

  useEffect(() => {
    let active = true;
    Promise.all([fetch("/api/events"), fetch("/api/auth/session")])
      .then(async ([eventsResponse, sessionResponse]) => {
        const eventsData = await eventsResponse.json();
        const sessionData = await sessionResponse.json();
        if (!active) return;
        if (eventsResponse.ok) setEvents(eventsData.events);
        else void showError(eventsData.message);
        setUser(sessionData.user);
      })
      .catch(() => {
        if (active) void showError("Agenda gagal dimuat.");
      });
    return () => { active = false; };
  }, []);

  async function saveEvent(event: React.FormEvent) {
    event.preventDefault();
    const url = "/api/events";
    const method = editingId ? "PATCH" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) return showError(data.message);
    setForm({ title: "", eventDate: "", location: "", description: "", visibility: "PUBLIC" });
    setEditingId(null);
    setIsModalOpen(false);
    await load();
    await showSuccess(editingId ? "Kegiatan berhasil diperbarui." : "Kegiatan berhasil dibuat.");
  }

  async function deleteEvent(id: string) {
    if (!await confirmAction("Hapus Kegiatan?", "Kegiatan ini beserta absensi/dokumentasi terkait akan dihapus.")) return;
    const response = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return showError(data.message || "Gagal menghapus kegiatan.");
    await load();
    await showSuccess("Kegiatan berhasil dihapus.");
  }

  async function handleDownloadQr() {
    if (!qrCardRef.current || !selectedQrEvent) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(qrCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      const fileName = selectedQrEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.download = `qr-absensi-${fileName}.png`;
      link.click();
      await showSuccess("QR Code absensi berhasil diunduh (PNG).");
    } catch {
      await showError("Gagal mengunduh QR Code.");
    } finally {
      setDownloading(false);
    }
  }

  function handlePrintQr() {
    if (!qrCardRef.current || !selectedQrEvent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      void showError("Gagal membuka jendela cetak.");
      return;
    }
    const content = qrCardRef.current.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak QR Absensi - ${selectedQrEvent.title}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fff; text-align: center; padding: 20px; }
            .print-container { max-width: 480px; width: 100%; }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${content}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <DashboardShell title="Agenda Kegiatan">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Agenda Kegiatan</h2>
            <p className="text-sm text-slate-500">Jadwal, lokasi, dan status dokumentasi kegiatan.</p>
          </div>
          {user && ["KETUA", "SEKRETARIS", "PENGURUS"].includes(user.role) && (
            <Button onClick={() => { setEditingId(null); setForm({ title: "", eventDate: "", location: "", description: "", visibility: "PUBLIC" }); setIsModalOpen(true); }}>
              <Plus size={17} /> Buat Kegiatan
            </Button>
          )}
        </div>

        <section className="space-y-3">
          {events.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${item.visibility === "PUBLIC" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                      {item.visibility}
                    </span>
                    <span className="text-xs text-slate-500">{item._count.attendances} hadir</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.description || "Tidak ada deskripsi."}</p>
                </div>
                <div className="flex flex-col justify-between gap-2 text-left sm:text-right shrink-0">
                  <div>
                    <p className="font-semibold text-[#0F766E] text-xs sm:text-sm">{new Date(item.eventDate).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 sm:justify-end">
                      <MapPin size={13} /> {item.location}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:justify-end">
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&details=${encodeURIComponent(item.description || "")}&location=${encodeURIComponent(item.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      title="Tambah ke Google Calendar"
                    >
                      <CalendarPlus size={14} className="text-[#0F766E]" />
                      <span>Google Calendar</span>
                    </a>

                    <button
                      onClick={() => setSelectedQrEvent(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/80 px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-teal-100 transition-colors"
                    >
                      <QrCode size={14} />
                      <span>QR Absensi</span>
                    </button>

                    {user && ["KETUA", "SEKRETARIS", "PENGURUS"].includes(user.role) && (
                      <div className="flex items-center gap-1">
                        <button
                          title="Edit Kegiatan"
                          onClick={() => {
                            setEditingId(item.id);
                            const d = new Date(item.eventDate);
                            const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                            setForm({
                              title: item.title,
                              eventDate: localIso,
                              location: item.location,
                              description: item.description || "",
                              visibility: item.visibility
                            });
                            setIsModalOpen(true);
                          }}
                          className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Hapus Kegiatan"
                          onClick={() => deleteEvent(item.id)}
                          className="rounded-xl border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
          {!events.length && <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">Belum ada kegiatan.</div>}
        </section>

        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingId(null); }}
          title={editingId ? "Edit Kegiatan" : "Buat Kegiatan"}
          description={editingId ? "Perbarui informasi kegiatan ini." : "Tambahkan agenda kegiatan baru."}
          size="lg"
        >
          <form onSubmit={saveEvent} className="space-y-4">
            <Field label="Judul Kegiatan">
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Kerja Bakti Desa" className="field" />
            </Field>
            <Field label="Waktu Kegiatan">
              <input required type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="field" />
            </Field>
            <Field label="Lokasi">
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Contoh: Balai Dusun" className="field" />
            </Field>
            <Field label="Deskripsi">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi acara..." rows={4} className="field resize-y" />
            </Field>
            <Field label="Visibilitas">
              <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="field">
                <option value="PUBLIC">Publik</option>
                <option value="INTERNAL">Internal</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditingId(null); }}>Batal</Button>
              <Button type="submit">{editingId ? "Simpan Perubahan" : "Simpan Kegiatan"}</Button>
            </div>
          </form>
        </Modal>
        {/* Modal QR Code Absensi Kegiatan */}
        {selectedQrEvent && (
          <Modal
            isOpen={!!selectedQrEvent}
            onClose={() => setSelectedQrEvent(null)}
            title="QR Code Absensi Kegiatan"
            description="Cetak atau unduh QR Code ini agar anggota dapat melakukan absensi secara mandiri."
            size="md"
          >
            <div className="space-y-4">
              <div ref={qrCardRef} className="rounded-2xl border-2 border-teal-700 bg-white p-6 text-center shadow-sm">
                <div className="border-b border-teal-100 pb-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#0F766E]">Karang Taruna &quot;TUNAS HARAPAN&quot;</p>
                  <p className="text-xs font-semibold text-slate-500">Dusun Kemitir</p>
                </div>

                <div className="my-4 space-y-1">
                  <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold text-[#0F766E] border border-teal-100">
                    ABSENSI MANDIRI QR CODE
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedQrEvent.title}</h3>
                  <p className="text-xs font-medium text-slate-600">
                    {new Date(selectedQrEvent.eventDate).toLocaleString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
                  </p>
                  <p className="text-xs text-slate-500">📍 {selectedQrEvent.location}</p>
                </div>

                <div className="my-4 inline-block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <QRCodeSVG value={selectedQrEvent.eventQrToken} size={210} level="H" includeMargin={true} />
                </div>

                <div className="rounded-xl bg-teal-50/90 p-3 text-xs font-semibold text-[#0F766E] border border-teal-200/80">
                  📱 Scan QR Code ini menggunakan menu &quot;Scan Absensi QR&quot; pada aplikasi Karang Taruna untuk mencatat absensi.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setSelectedQrEvent(null)}>
                  Tutup
                </Button>
                <Button type="button" variant="secondary" onClick={handlePrintQr}>
                  <Printer size={16} /> Cetak / Print
                </Button>
                <Button type="button" onClick={handleDownloadQr} disabled={downloading}>
                  <Download size={16} /> {downloading ? "Mengunduh..." : "Unduh Gambar (PNG)"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardShell>
  );
}

