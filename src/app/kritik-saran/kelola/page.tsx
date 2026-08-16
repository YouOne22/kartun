"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, User, UserCircle, Calendar, Mail, AlertCircle, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Alert, confirmAction, showError, showSuccess } from "@/components/AlertProvider";
import { DashboardShell } from "@/components/DashboardShell";

type Suggestion = {
  id: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    memberId: string;
    role: string;
  } | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function KelolaKritikSaranPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/suggestions?page=${page}&limit=20`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("Anda tidak memiliki akses");
        throw new Error("Gagal memuat data");
      }
      const data = await res.json();
      setSuggestions(data.suggestions);
      setPagination(data.pagination);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions(1);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy, HH:mm", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const roleLabels: Record<string, string> = {
    KETUA: "Ketua",
    SEKRETARIS: "Sekretaris",
    BENDAHARA: "Bendahara",
    ANGGOTA: "Anggota",
  };

  function showSuggestionDetail(s: Suggestion) {
    const sender = s.isAnonymous
      ? "Anonim"
      : s.user?.fullName || "Tidak diketahui";
    Alert.fire({
      icon: "info",
      title: "Kritik & Saran",
      html: `<div class="text-left"><p class="mb-3 whitespace-pre-wrap text-slate-700">${s.content}</p><div class="text-xs text-slate-500 space-y-1"><div><strong>Dikirim:</strong> ${formatDate(s.createdAt)}</div><div><strong>Pengirim:</strong> ${sender}</div>${s.user ? `<div><strong>ID:</strong> ${s.user.memberId}</div><div><strong>Peran:</strong> ${roleLabels[s.user.role] || s.user.role}</div>` : ""}</div></div>`,
      confirmButtonText: "Tutup",
    });
  }

  async function deleteSuggestion(id: string) {
    if (!await confirmAction("Hapus Kritik & Saran?", "Masukkan ini akan dihapus secara permanen dan tidak dapat dikembalikan.")) return;
    const res = await fetch(`/api/suggestions?id=${id}`, { method: "DELETE" });
    const data = await res.json() as { message?: string };
    if (!res.ok) return showError(data.message || "Gagal menghapus kritik dan saran.");
    await showSuccess("Kritik dan saran berhasil dihapus.");
    await fetchSuggestions(pagination.page);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#059669]" />
      </div>
    );
  }

  return (
    <DashboardShell title="Kelola Kritik & Saran">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Kritik & Saran</h1>
          <p className="mt-1 text-slate-500">
            Total {pagination.total} masukkan dari warga. Hanya pengurus yang dapat melihat halaman ini.
          </p>
        </div>
        <Link
          href="/kritik-saran"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={18} />
          Kirim Kritik & Saran
        </Link>
      </div>

      {suggestions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Mail className="h-12 w-12 mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700">Belum ada kritik dan saran</h3>
          <p className="mt-1 text-slate-500">Masukkan dari warga akan muncul di sini.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengirim</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Isi</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suggestions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                      <Calendar className="h-4 w-4 inline-block mr-1 -mt-0.5" />
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      {s.isAnonymous ? (
                        <div className="flex items-center gap-2 text-slate-500">
                          <UserCircle className="h-5 w-5 text-slate-400" />
                          <span className="font-medium">Anonim</span>
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-slate-900">{s.user?.fullName || "Tidak diketahui"}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <span>ID: {s.user?.memberId || "-"}</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {roleLabels[s.user?.role || ""] || s.user?.role}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 max-w-md">
                      <p className="text-sm text-slate-700 line-clamp-2">{s.content}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => showSuggestionDetail(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          title="Lihat detail"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => deleteSuggestion(s.id)}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">
                Halaman {pagination.page} dari {pagination.totalPages} · Total {pagination.total} data
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchSuggestions(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => fetchSuggestions(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </DashboardShell>
  );
}