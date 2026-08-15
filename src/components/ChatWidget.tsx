import { MessageCircle, X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { SessionUser } from "@/components/DashboardShell";

type Message = { role: "user" | "system"; content: string; time: string };
const now = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const QUICK_REPLIES = [
  "Bagaimana cara daftar kegiatan?",
  "Kapan rapat bulanan berikutnya?",
  "Cara ajukan pinjaman dana?",
  "Saya ingin menyumbang untuk kas",
  "Jadwal kegiatan minggu ini apa?",
  "Cara bergabung Karang Taruna?",
];

function getReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("kegiatan") || lower.includes("acara") || lower.includes("jadwal")) {
    return "Untuk melihat jadwal kegiatan, silakan buka menu Kegiatan > Agenda di sidebar. Semua info kegiatan terbaru ada di sana! 📅";
  } else if (lower.includes("pinjaman") || lower.includes("pinjam") || lower.includes("dana")) {
    return "Pengajuan pinjaman bisa dilakukan melalui menu Keuangan > Pinjaman. Ajukan pinjaman dan tunggu persetujuan dari Bendahara. 💰";
  } else if (lower.includes("sumbang") || lower.includes("kas")) {
    return "Kontribusi kas keuangan bisa dilaporkan melalui menu Keuangan > Pemasukan. Terima kasih atas kepeduliannya! 🙏";
  } else if (lower.includes("rapat") || lower.includes("meeting")) {
    return "Informasi rapat bulanan biasanya diumumkan melalui menu Informasi > Pengumuman. Pantau terus ya! 📢";
  } else if (lower.includes("bergabung") || lower.includes("daftar") || lower.includes("anggota")) {
    return "Untuk menjadi anggota Karang Taruna Tunas Harapan, silakan hubungi Sekretaris melalui menu Kritik & Saran atau langsung hubungi Ketua. 🤝";
  }
  return "Terima kasih atas pesannya! Tim kami akan segera merespon. 😊";
}

export default function ChatWidget({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = user?.fullName ? `Halo ${user.fullName}! 👋\nAda yang bisa kami bantu hari ini?` : "Halo! 👋\nAda yang bisa kami bantu hari ini?";
      setMessages([{ role: "system", content: greeting, time: now() }]);
    }
  }, [open, messages.length, user?.fullName]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text.trim(), time: now() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "system", content: getReply(text), time: now() }]);
      setTyping(false);
    }, 800 + Math.random() * 700);
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${open ? "bg-slate-800 text-white" : "bg-[#0F766E] text-white hover:scale-105 hover:shadow-xl hover:bg-teal-700"}`} aria-label={open ? "Tutup chat" : "Buka chat"}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">1</span>}
      </button>

      {open && (
        <div className="fixed bottom-22 right-5 z-50 flex w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:w-[380px]" style={{ maxHeight: "min(520px, calc(100vh - 120px))" }}>
          <div className="bg-gradient-to-r from-[#073833] via-[#0F766E] to-[#14B8A6] px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-teal-950 shadow-md"><span className="text-sm font-black">KT</span></div>
                <div>
                  <h4 className="text-sm font-bold">Karang Taruna Bot</h4>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[10px] text-teal-100">Online sekarang</span></div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-xl p-1.5 text-teal-100 hover:bg-white/10"><X size={17} /></button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.role === "user" ? "bg-[#0F766E] text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <p className={`mt-1 text-[9px] ${msg.role === "user" ? "text-teal-200" : "text-slate-400"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "120ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 pt-2.5">
              {QUICK_REPLIES.slice(0, 3).map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[10px] font-medium text-teal-700 hover:bg-teal-100 transition-colors">
                  {q.length > 28 ? q.substring(0, 28) + "..." : q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-4 py-2.5">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} placeholder="Ketik pesan..." className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-teal-500 focus:bg-white transition-all" />
            <button onClick={() => sendMessage(input)} disabled={!input.trim()} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F766E] text-white transition-colors hover:bg-teal-700 disabled:opacity-40"><Send size={15} /></button>
          </div>
        </div>
      )}
    </>
  );
}