"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Edit3, ExternalLink, ImagePlus, Maximize2, Trash2, Upload, X } from "lucide-react";
import { type SessionUser } from "@/components/DashboardShell";
import { confirmAction, rejectionReason, showError, showSuccess } from "@/components/AlertProvider";
import Modal from "@/components/Modal";

type Doc = { 
  id: string; 
  photoUrlThumb: string; 
  photoUrlHd: string; 
  caption: string | null; 
  status: string; 
  rejectionReason: string | null; 
  event: { id: string; title: string }; 
};
type EventItem = { id: string; title: string };
type FormState = { eventId: string; photo: File | null; caption: string };

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const initialForm: FormState = { eventId: "", photo: null, caption: "" };

export function DocumentationManager({ moderationOnly = false }: { moderationOnly?: boolean }) {
  const [items, setItems] = useState<Doc[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [preview, setPreview] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Doc | null>(null);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const response = await fetch("/api/documentations", { cache: "no-store" });
    const data = await response.json() as { documentations?: Doc[]; message?: string };
    if (response.ok) setItems(data.documentations || []);
    else void showError(data.message || "Dokumentasi gagal dimuat.");
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/documentations", { cache: "no-store" }),
      fetch("/api/events", { cache: "no-store" }),
      fetch("/api/auth/session")
    ]).then(async ([documentationResponse, eventResponse, sessionResponse]) => {
      const documentationData = await documentationResponse.json() as { documentations?: Doc[] };
      const eventData = await eventResponse.json() as { events?: EventItem[] };
      const sessionData = await sessionResponse.json() as { user?: SessionUser | null };
      if (!active) return;
      if (documentationResponse.ok) setItems(documentationData.documentations || []);
      if (eventResponse.ok) setEvents(eventData.events || []);
      setUser(sessionData.user || null);
    }).catch(() => { if (active) void showError("Dokumentasi gagal dimuat."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !saving) closeUploadModal(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [modalOpen, saving]);

  function closeUploadModal() {
    if (saving) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setForm(initialForm);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(false);
  }

  function choosePhoto(file: File | undefined) {
    if (!file) return;
    if (!allowedPhotoTypes.has(file.type) || file.size > MAX_PHOTO_SIZE) {
      void showError("Foto harus berupa JPG, PNG, WebP, atau GIF maksimal 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setForm(current => ({ ...current, photo: file }));
    setPreview(URL.createObjectURL(file));
  }

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!form.photo) { void showError("Foto dokumentasi wajib dipilih."); return; }
    setSaving(true);
    try {
      const body = new FormData();
      body.append("eventId", form.eventId);
      body.append("photo", form.photo);
      body.append("caption", form.caption);
      const response = await fetch("/api/documentations", { method: "POST", body });
      const data = await response.json() as { message?: string };
      if (!response.ok) { void showError(data.message || "Dokumentasi gagal diunggah."); return; }
      closeUploadModal();
      await load();
      await showSuccess("Dokumentasi dikirim untuk moderasi.");
    } catch {
      void showError("Dokumentasi gagal diunggah.");
    } finally {
      setSaving(false);
    }
  }

  async function replacePhoto(file: File | undefined, doc: Doc) {
    if (!file) return;
    if (!allowedPhotoTypes.has(file.type) || file.size > MAX_PHOTO_SIZE) {
      void showError("Foto harus berupa JPG, PNG, WebP, atau GIF maksimal 5 MB.");
      if (replaceInputRef.current) replaceInputRef.current.value = "";
      return;
    }
    if (!await confirmAction("Ganti Foto?", "Foto lama akan dihapus dan digantikan dengan foto baru.")) return;
    setSaving(true);
    try {
      const body = new FormData();
      body.append("eventId", doc.event.id);
      body.append("photo", file);
      if (doc.caption) body.append("caption", doc.caption);

      const uploadResponse = await fetch("/api/documentations", { method: "POST", body });
      if (!uploadResponse.ok) {
        const uploadData = await uploadResponse.json() as { message?: string };
        void showError(uploadData.message || "Gagal mengunggah foto baru.");
        return;
      }

      await fetch(`/api/documentations?id=${doc.id}`, { method: "DELETE" });

      setViewingDoc(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
      await load();
      await showSuccess("Foto berhasil diganti.");
    } catch {
      void showError("Gagal mengganti foto.");
    } finally {
      setSaving(false);
    }
  }

  async function moderate(item: Doc, status: "APPROVED" | "REJECTED") {
    const reason = status === "REJECTED" ? await rejectionReason("Alasan penolakan foto") : null;
    if (status === "REJECTED" && !reason) return;
    if (status === "APPROVED" && !await confirmAction("Setujui dokumentasi?", "Foto akan masuk galeri dan PDF.")) return;
    const response = await fetch("/api/documentations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status, rejectionReason: reason })
    });
    const data = await response.json() as { message?: string };
    if (!response.ok) { void showError(data.message || "Moderasi dokumentasi gagal diproses."); return; }
    await load();
    await showSuccess(status === "APPROVED" ? "Foto disetujui." : "Foto ditolak.");
  }

  async function deleteDoc(id: string) {
    if (!await confirmAction("Hapus Dokumentasi?", "Foto dokumentasi ini akan dihapus secara permanen.")) return;
    const response = await fetch(`/api/documentations?id=${id}`, { method: "DELETE" });
    const data = await response.json() as { message?: string };
    if (!response.ok) { void showError(data.message || "Dokumentasi gagal dihapus."); return; }
    await load();
    await showSuccess("Dokumentasi berhasil dihapus.");
  }

  const canModerate = !!user && ["KETUA", "SEKRETARIS", "PENGURUS", "PENGURUS"].includes(user.role);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{moderationOnly ? "Moderasi Dokumentasi" : "Dokumentasi Kegiatan"}</h2>
          <p className="text-sm text-slate-500">Foto approved tampil di galeri dan laporan.</p>
        </div>
        {!moderationOnly && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            <ImagePlus size={17} />
            Kirim Foto
          </button>
        )}
      </div>

      {moderationOnly && !canModerate && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Halaman ini khusus Ketua dan Sekretaris.</p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <article key={item.id} className="group relative overflow-hidden rounded-2xl border bg-white/85 shadow-sm transition-all hover:shadow-md">
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                src={item.photoUrlThumb} 
                alt={item.caption || item.event.title} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <button
                type="button"
                onClick={() => setViewingDoc(item)}
                className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Maximize2 className="text-white" size={28} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-between text-xs">
                <b className={item.status === "APPROVED" ? "text-emerald-700" : item.status === "REJECTED" ? "text-red-600" : "text-amber-600"}>
                  {item.status}
                </b>
                <span>{item.event.title}</span>
              </div>
              <p className="mt-2 text-sm">{item.caption || "Tanpa keterangan"}</p>
              {item.rejectionReason && (
                <p className="mt-2 text-xs text-red-600">Alasan: {item.rejectionReason}</p>
              )}
              {canModerate && (
                <div className="mt-3 flex items-center gap-2">
                  {item.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        onClick={() => void moderate(item, "APPROVED")}
                        className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                        title="Setujui"
                      >
                        <Check size={14} className="mx-auto" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void moderate(item, "REJECTED")}
                        className="flex-1 rounded-lg bg-amber-50 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"
                        title="Tolak"
                      >
                        <X size={14} className="mx-auto" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteDoc(item.id)}
                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 hover:bg-red-100"
                    title="Hapus Foto"
                  >
                    <Trash2 size={14} className="mx-auto" />
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
        {!items.length && (
          <p className="p-8 text-center text-sm text-slate-500 sm:col-span-3">Belum ada dokumentasi.</p>
        )}
      </section>

      {!moderationOnly && modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={event => { if (event.target === event.currentTarget) closeUploadModal(); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="documentation-upload-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="documentation-upload-title" className="text-lg font-bold">Kirim Dokumentasi</h2>
                <p className="mt-1 text-sm text-slate-500">Pilih satu foto kegiatan untuk diproses ke versi utama dan thumbnail.</p>
              </div>
              <button
                type="button"
                onClick={closeUploadModal}
                aria-label="Tutup form dokumentasi"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={upload} className="space-y-4">
              <label className="block text-xs font-medium text-slate-600">
                Kegiatan
                <select
                  required
                  value={form.eventId}
                  onChange={event => setForm(current => ({ ...current, eventId: event.target.value }))}
                  className="field mt-1"
                >
                  <option value="">Pilih kegiatan</option>
                  {events.map(item => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-medium text-slate-600">
                Foto kegiatan
                <div className="mt-1 flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    required
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={event => choosePhoto(event.target.files?.[0])}
                    className="hidden"
                    id="documentation-file-input"
                  />
                  <label
                    htmlFor="documentation-file-input"
                    className="cursor-pointer rounded-xl bg-teal-50 px-4 py-2.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 border border-teal-200 shadow-sm transition-colors"
                  >
                    Pilih File Foto
                  </label>
                  <span className="text-xs text-slate-500 truncate">
                    {form.photo ? form.photo.name : "Belum ada file dipilih"}
                  </span>
                </div>
                <span className="mt-1 block text-[11px] font-normal text-slate-500">JPG, PNG, WebP, atau GIF. Maksimal 5 MB.</span>
              </label>

              {preview && (
                <div className="overflow-hidden rounded-xl border bg-slate-50">
                  <img src={preview} alt="Pratinjau foto dokumentasi" className="max-h-64 w-full object-contain" />
                </div>
              )}

              <label className="block text-xs font-medium text-slate-600">
                Keterangan
                <input
                  maxLength={500}
                  value={form.caption}
                  onChange={event => setForm(current => ({ ...current, caption: event.target.value }))}
                  placeholder="Keterangan foto (opsional)"
                  className="field mt-1"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={saving}
                  className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Mengunggah..." : <><Upload size={16} />Kirim untuk Moderasi</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title="Detail Dokumentasi"
        size="lg"
      >
        {viewingDoc && (
          <div className="space-y-6">
            <div className="group relative overflow-hidden rounded-xl border bg-slate-900">
              <img 
                src={viewingDoc.photoUrlHd} 
                alt={viewingDoc.caption || viewingDoc.event.title} 
                className="max-h-[65vh] w-full object-contain"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <a 
                  href={viewingDoc.photoUrlHd} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm hover:bg-white"
                >
                  <ExternalLink size={14} />
                  Lihat Full
                </a>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kegiatan</h4>
                  <p className="mt-1 font-semibold text-slate-900">{viewingDoc.event.title}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Keterangan</h4>
                  <p className="mt-1 text-sm text-slate-600">{viewingDoc.caption || "Tanpa keterangan."}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</h4>
                  <div className="mt-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      viewingDoc.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : 
                      viewingDoc.status === "REJECTED" ? "bg-red-100 text-red-700" : 
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {viewingDoc.status}
                    </span>
                  </div>
                </div>

                {!moderationOnly && (
                  <div className="flex flex-col gap-2 pt-2">
                    <input
                      ref={replaceInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => void replacePhoto(e.target.files?.[0], viewingDoc)}
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => replaceInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 py-2.5 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-100 disabled:opacity-50"
                    >
                      {saving ? "Memproses..." : <><Edit3 size={14} />Ganti Foto</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const id = viewingDoc.id;
                        setViewingDoc(null);
                        void deleteDoc(id);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

