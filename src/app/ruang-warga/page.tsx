"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MessageCircle, Plus, Send, Vote, X, Trash2, Ban } from "lucide-react";
import { DashboardShell, type SessionUser } from "@/components/DashboardShell";
import { showError, showSuccess, confirmAction } from "@/components/AlertProvider";

type ChatMessage = { id: string; message: string; createdAt: string; sender: { fullName: string; role: string; avatarUrl: string | null } };
type Polling = { id: string; title: string; description: string | null; isActive: boolean; hasVoted: boolean; votedOptionId: string | null; options: { id: string; optionText: string; _count: { votes: number } }[] };
export default function CommunityPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pollings, setPollings] = useState<Polling[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  async function load() { 
    try {
      const [chatResponse, pollingResponse, sessionResponse] = await Promise.all([
        fetch("/api/chat"), 
        fetch("/api/pollings"),
        fetch("/api/auth/session")
      ]); 
      const chatData = await chatResponse.json(); 
      const pollingData = await pollingResponse.json(); 
      const sessionData = await sessionResponse.json() as { user?: SessionUser };
      if (chatResponse.ok) setMessages(chatData.messages); 
      if (pollingResponse.ok) setPollings(pollingData.pollings); 
      if (sessionResponse.ok) setUser(sessionData.user || null);
      if (!chatResponse.ok && !pollingResponse.ok) showError(chatData.message || pollingData.message); 
    } catch {
      // ignore
    }
  }

  useEffect(() => { 
    let active = true; 
    const run = async () => { 
      try { 
        const [chatResponse, pollingResponse, sessionResponse] = await Promise.all([
          fetch("/api/chat"), 
          fetch("/api/pollings"),
          fetch("/api/auth/session")
        ]); 
        const chatData = await chatResponse.json(); 
        const pollingData = await pollingResponse.json(); 
        const sessionData = await sessionResponse.json() as { user?: SessionUser };
        if (!active) return; 
        if (chatResponse.ok) setMessages(chatData.messages); 
        if (pollingResponse.ok) setPollings(pollingData.pollings); 
        if (sessionResponse.ok) setUser(sessionData.user || null);
      } catch { 
        if (active) void showError("Ruang warga gagal dimuat."); 
      } 
    }; 
    void run(); 
    const interval = window.setInterval(() => { void run(); }, 10000); 
    return () => { 
      active = false; 
      window.clearInterval(interval); 
    }; 
  }, []);

  /* tandai semua pesan sudah dibaca */
  useEffect(() => {
    if (messages.length > 0) localStorage.setItem("th_seen_messages", new Date().toISOString());
  }, [messages]);

  async function sendMessage(event: FormEvent) { 
    event.preventDefault(); 
    if (!message.trim()) return; 
    const response = await fetch("/api/chat", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ message }) 
    }); 
    const data = await response.json(); 
    if (!response.ok) return showError(data.message); 
    setMessage(""); 
    await load(); 
  }

  async function closePolling(pollingId: string) {
    if (!await confirmAction("Tutup Polling?", "Anggota tidak dapat memberikan suara lagi setelah polling ditutup.")) return;
    const res = await fetch("/api/pollings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollingId, action: "CLOSE" })
    });
    const data = await res.json();
    if (!res.ok) return showError(data.message || "Gagal menutup polling.");
    await load();
    await showSuccess("Polling berhasil ditutup.");
  }

  async function deletePolling(pollingId: string) {
    if (!await confirmAction("Hapus Polling?", "Semua data suara dan polling ini akan dihapus permanen.")) return;
    const res = await fetch("/api/pollings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollingId, action: "DELETE" })
    });
    const data = await res.json();
    if (!res.ok) return showError(data.message || "Gagal menghapus polling.");
    await load();
    await showSuccess("Polling berhasil dihapus.");
  }


  async function vote(pollingId: string, optionId: string) { 
    const response = await fetch("/api/pollings", { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ pollingId, optionId }) 
    }); 
    const data = await response.json(); 
    if (!response.ok) return showError(data.message); 
    await load(); 
    await showSuccess("Suara berhasil dicatat."); 
  }

  async function createPolling(event: FormEvent) {
    event.preventDefault();
    const filteredOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (!title.trim() || filteredOptions.length < 2) {
      return showError("Judul dan minimal 2 opsi pilihan wajib diisi.");
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/pollings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          options: filteredOptions,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Polling gagal dibuat.");
      await showSuccess("Polling baru berhasil dibuat.");
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setOptions(["", ""]);
      await load();
    } catch (err: unknown) {
      const errorObj = err as Error;
      showError(errorObj.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  const canCreatePoll = user && ["KETUA", "SEKRETARIS", "PENGURUS", "PENGURUS"].includes(user.role);

  return (
    <DashboardShell title="Ruang Warga">
      <div className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Ruang Warga</h2>
            <p className="text-sm text-slate-500">Komunikasi internal dan jajak pendapat organisasi.</p>
          </div>
          {canCreatePoll && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#115e59]"
            >
              <Plus size={16} /> Buat Polling Baru
            </button>
          )}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <section className="flex min-h-[520px] flex-col rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
              <MessageCircle size={18} className="text-[#0F766E]" />
              <h3 className="font-bold">Chat Umum</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.map((item) => {
                const initials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                return (
                  <div key={item.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    {item.sender.avatarUrl ? (
                      <img
                        src={item.sender.avatarUrl}
                        alt={`Foto ${item.sender.fullName}`}
                        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white">
                        {initials(item.sender.fullName)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-900">{item.sender.fullName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700 break-words">{item.message}</p>
                    </div>
                  </div>
                );
              })}
              {!messages.length && <p className="py-16 text-center text-sm text-slate-500">Belum ada pesan.</p>}
            </div>
            <form onSubmit={sendMessage} className="mt-4 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesan..."
                className="field flex-1"
              />
              <button
                aria-label="Kirim pesan"
                className="rounded-xl bg-[#0F766E] px-4 text-white hover:bg-[#115e59]"
              >
                <Send size={17} />
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Vote size={18} className="text-[#0F766E]" />
              <h3 className="font-bold">Polling Aktif & Riwayat</h3>
            </div>
            {pollings.map((poll) => (
              <article key={poll.id} className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${poll.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                        {poll.isActive ? "Aktif" : "Ditutup"}
                      </span>
                    </div>
                    <h4 className="font-bold">{poll.title}</h4>
                  </div>
                  {canCreatePoll && (
                    <div className="flex items-center gap-1">
                      {poll.isActive && (
                        <button
                          title="Tutup Polling"
                          onClick={() => closePolling(poll.id)}
                          className="rounded-lg border border-amber-200 p-1.5 text-amber-600 hover:bg-amber-50"
                        >
                          <Ban size={14} />
                        </button>
                      )}
                      <button
                        title="Hapus Polling"
                        onClick={() => deletePolling(poll.id)}
                        className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                {poll.description && <p className="mt-1 text-xs text-slate-500">{poll.description}</p>}
                <div className="mt-4 space-y-2">
                  {poll.options.map((option) => (
                    <button
                      disabled={!poll.isActive || poll.hasVoted}
                      key={option.id}
                      onClick={() => vote(poll.id, option.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                        poll.votedOptionId === option.id
                          ? "border-teal-500 bg-teal-50 text-[#0F766E]"
                          : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                      } ${(!poll.isActive || poll.hasVoted) ? "cursor-default opacity-90" : ""}`}
                    >
                      <span>{option.optionText}</span>
                      <span className="text-xs text-slate-500">{option._count.votes} suara</span>
                    </button>
                  ))}
                </div>
                {poll.hasVoted && <p className="mt-3 text-xs font-medium text-emerald-600">Suara Anda sudah tercatat.</p>}
                {!poll.isActive && !poll.hasVoted && <p className="mt-3 text-xs font-medium text-slate-500">Polling ini sudah ditutup.</p>}
              </article>
            ))}
            {!pollings.length && (
              <div className="rounded-2xl bg-white p-5 text-sm text-slate-500">Belum ada polling.</div>
            )}
          </section>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold">Buat Polling Baru</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createPolling} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Judul Polling</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pemilihan Lokasi Gathering Tahunan"
                  className="field w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Deskripsi (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Berikan keterangan tambahan jika diperlukan..."
                  className="field w-full min-h-[80px]"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">Pilihan Opsi (Minimal 2)</label>
                  {options.length < 10 && (
                    <button
                      type="button"
                      onClick={() => setOptions([...options, ""])}
                      className="text-xs font-medium text-[#0F766E] hover:underline"
                    >
                      + Tambah Opsi
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {options.map((opt, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        required={index < 2}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[index] = e.target.value;
                          setOptions(newOpts);
                        }}
                        placeholder={`Opsi ${index + 1}`}
                        className="field flex-1"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setOptions(options.filter((_, i) => i !== index))}
                          className="rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#0F766E] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#115e59] disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Publikasikan Polling"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

