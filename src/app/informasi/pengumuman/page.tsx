"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Megaphone, Pin, Plus, Pencil, Trash2 } from "lucide-react";
import { DashboardShell, type SessionUser } from "@/components/DashboardShell";
import { confirmAction, showError, showSuccess } from "@/components/AlertProvider";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

type Visibility = "PUBLIC" | "INTERNAL";
type Announcement = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  visibility: Visibility;
  createdAt: string;
  author: { fullName: string } | null;
};
type AnnouncementData = { announcements: Announcement[] };

const visibilityLabel: Record<Visibility, string> = { PUBLIC: "Publik", INTERNAL: "Internal" };
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", visibility: "PUBLIC" as Visibility, isPinned: false });

  async function loadData() {
    const [announcementResponse, sessionResponse] = await Promise.all([fetch("/api/announcements"), fetch("/api/auth/session")]);
    const announcementData = await announcementResponse.json() as AnnouncementData & { message?: string };
    const sessionData = await sessionResponse.json() as { user?: SessionUser };
    if (!announcementResponse.ok) throw new Error(announcementData.message || "Pengumuman gagal dimuat.");
    setAnnouncements(announcementData.announcements);
    setUser(sessionData.user || null);
  }

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      loadData().catch((error: Error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  async function saveAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = "/api/announcements";
    const method = editingId ? "PATCH" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json() as { message?: string };
    if (!response.ok) return showError(data.message || "Pengumuman gagal disimpan.");
    setForm({ title: "", content: "", visibility: "PUBLIC", isPinned: false });
    setEditingId(null);
    setIsModalOpen(false);
    await loadData();
    await showSuccess(editingId ? "Pengumuman berhasil diperbarui." : "Pengumuman berhasil diterbitkan.");
  }

  async function togglePin(announcement: Announcement) {
    const response = await fetch("/api/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: announcement.id, action: "TOGGLE_PIN" })
    });
    const data = await response.json() as { message?: string };
    if (!response.ok) return showError(data.message || "Gagal mengubah status pin.");
    await loadData();
    await showSuccess(announcement.isPinned ? "Pengumuman dilepas dari pin." : "Pengumuman disematkan di atas.");
  }

  async function deleteAnnouncement(id: string) {
    if (!await confirmAction("Hapus Pengumuman?", "Pengumuman ini akan dihapus secara permanen.")) return;
    const response = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    const data = await response.json() as { message?: string };
    if (!response.ok) return showError(data.message || "Pengumuman gagal dihapus.");
    await loadData();
    await showSuccess("Pengumuman berhasil dihapus.");
  }

  const canManage = !!user && ["KETUA", "SEKRETARIS"].includes(user.role);

  return (
    <DashboardShell title="Pengumuman">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Pengumuman</h2>
            <p className="text-sm text-slate-500">Informasi terbaru untuk anggota Karang Taruna TUNAS HARAPAN.</p>
          </div>
          {canManage && (
            <Button onClick={() => { setEditingId(null); setForm({ title: "", content: "", visibility: "PUBLIC", isPinned: false }); setIsModalOpen(true); }}>
              <Plus size={17} /> Tambah Pengumuman
            </Button>
          )}
        </div>
        {message && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{message}</div>}

        <section className="space-y-3">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${announcement.visibility === "PUBLIC" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {visibilityLabel[announcement.visibility]}
                    </span>
                    {announcement.isPinned && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                        <Pin size={11} /> Disematkan
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold">{announcement.title}</h3>
                </div>
                <div className="text-left text-xs text-slate-500 sm:text-right">
                  <p>{dateFormat.format(new Date(announcement.createdAt))}</p>
                  <p className="mt-1">Oleh {announcement.author?.fullName || "Pengurus"}</p>
                  {canManage && (
                    <div className="mt-2 flex items-center justify-end gap-1">
                      <button
                        title={announcement.isPinned ? "Lepas Pin" : "Sematkan"}
                        onClick={() => togglePin(announcement)}
                        className={`rounded-lg border p-1.5 transition-colors ${announcement.isPinned ? "border-amber-200 bg-amber-50 text-amber-600" : "border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                      >
                        <Pin size={14} />
                      </button>
                      <button
                        title="Edit Pengumuman"
                        onClick={() => {
                          setEditingId(announcement.id);
                          setForm({
                            title: announcement.title,
                            content: announcement.content,
                            visibility: announcement.visibility,
                            isPinned: announcement.isPinned
                          });
                          setIsModalOpen(true);
                        }}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="Hapus Pengumuman"
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{announcement.content}</p>
            </article>
          ))}
          {!loading && !announcements.length && (
            <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">
              <Megaphone className="mx-auto mb-3 text-slate-300" size={28} /> Belum ada pengumuman.
            </div>
          )}
          {loading && <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">Memuat pengumuman...</div>}
        </section>

        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingId(null); }}
          title={editingId ? "Edit Pengumuman" : "Buat Pengumuman"}
          description={editingId ? "Perbarui informasi pengumuman ini." : "Publikasikan pengumuman atau informasi terbaru."}
          size="lg"
        >
          <form onSubmit={saveAnnouncement} className="space-y-4">
            <Field label="Judul Pengumuman">
              <input required maxLength={150} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Judul pengumuman..." className="field" />
            </Field>
            <Field label="Isi Pengumuman">
              <textarea required maxLength={10000} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Tulis isi pengumuman di sini..." rows={6} className="field resize-y" />
            </Field>
            <Field label="Visibilitas">
              <select value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value as Visibility })} className="field">
                <option value="PUBLIC">Publik — dapat dilihat semua anggota</option>
                <option value="INTERNAL">Internal — khusus pengurus</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-600 pt-1">
              <input type="checkbox" checked={form.isPinned} onChange={(event) => setForm({ ...form, isPinned: event.target.checked })} className="h-4 w-4 accent-teal-700 rounded" />
              Sematkan di bagian atas
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditingId(null); }}>Batal</Button>
              <Button type="submit">{editingId ? "Simpan Perubahan" : "Terbitkan Pengumuman"}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
