"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus, Wallet, Pencil, Trash2 } from "lucide-react";
import { DashboardShell, type SessionUser } from "@/components/DashboardShell";
import { confirmAction, showError, showSuccess } from "@/components/AlertProvider";
import StatCard from "@/components/StatCard";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import ResponsiveTable from "@/components/ResponsiveTable";

type Transaction = { id: string; transactionDate: string; type: "INCOME" | "EXPENSE"; amount: number | string; category: string; description: string | null; creator: { fullName: string } | null };
type FinanceData = { transactions: Transaction[]; summary: { income: number; expense: number; balance: number } };
const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "INCOME" as "INCOME" | "EXPENSE", category: "", amount: "", description: "" });

  async function loadData() {
    const [financeResponse, sessionResponse] = await Promise.all([fetch("/api/finance"), fetch("/api/auth/session")]);
    const financeJson = await financeResponse.json() as FinanceData & { message?: string };
    const sessionJson = await sessionResponse.json() as { user?: SessionUser };
    if (!financeResponse.ok) throw new Error(financeJson.message || "Data kas gagal dimuat.");
    setData(financeJson); setUser(sessionJson.user || null);
  }

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      loadData().catch((error: Error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  async function saveTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const url = "/api/finance";
    const method = editingId ? "PATCH" : "POST";
    const body = editingId
      ? { id: editingId, ...form, amount: Number(form.amount) }
      : { ...form, amount: Number(form.amount) };

    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as { message?: string };
    if (!response.ok) return showError(result.message || "Transaksi kas gagal disimpan.");
    setForm({ type: "INCOME", category: "", amount: "", description: "" });
    setEditingId(null);
    setIsModalOpen(false);
    await loadData();
    await showSuccess(editingId ? "Transaksi kas berhasil diperbarui." : "Transaksi kas berhasil disimpan.");
  }

  async function deleteTransaction(id: string) {
    if (!await confirmAction("Hapus Transaksi Kas?", "Transaksi ini akan dihapus secara permanen.")) return;
    const response = await fetch(`/api/finance?id=${id}`, { method: "DELETE" });
    const data = await response.json() as { message?: string };
    if (!response.ok) return showError(data.message || "Transaksi kas gagal dihapus.");
    await loadData();
    await showSuccess("Transaksi kas berhasil dihapus.");
  }

  const canManage = !!user && ["KETUA", "BENDAHARA"].includes(user.role);
  const transactions = useMemo(() => data?.transactions || [], [data]);

  const columns = [
    { key: "date", header: "Tanggal", render: (t: Transaction) => dateFormat.format(new Date(t.transactionDate)) },
    { key: "type", header: "Jenis", render: (t: Transaction) => <span className={`font-semibold ${t.type === "INCOME" ? "text-emerald-600" : "text-red-600"}`}>{t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}</span> },
    { key: "category", header: "Kategori", render: (t: Transaction) => t.category },
    { key: "amount", header: "Nominal", render: (t: Transaction) => <span className="font-semibold">{money.format(Number(t.amount))}</span> },
    { key: "description", header: "Keterangan", render: (t: Transaction) => <span className="max-w-xs text-slate-600">{t.description || "-"}</span> },
    { key: "creator", header: "Pencatat", render: (t: Transaction) => <span className="text-slate-600">{t.creator?.fullName || "-"}</span> },
    {
      key: "action",
      header: "Aksi",
      render: (t: Transaction) =>
        canManage ? (
          <div className="flex gap-2">
            <button
              title="Edit Transaksi"
              onClick={() => {
                setEditingId(t.id);
                setForm({
                  type: t.type,
                  category: t.category,
                  amount: String(t.amount),
                  description: t.description || ""
                });
                setIsModalOpen(true);
              }}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
            >
              <Pencil size={14} />
            </button>
            <button
              title="Hapus Transaksi"
              onClick={() => deleteTransaction(t.id)}
              className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <DashboardShell title="Keuangan">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Keuangan</h2>
            <p className="text-sm text-slate-500">Pencatatan pemasukan, pengeluaran, dan saldo kas organisasi.</p>
          </div>
          {canManage && (
            <Button onClick={() => { setEditingId(null); setForm({ type: "INCOME", category: "", amount: "", description: "" }); setIsModalOpen(true); }}>
              <Plus size={17} /> Tambah Transaksi
            </Button>
          )}
        </div>
        {message && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{message}</div>}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Total Pemasukan" value={loading ? "-" : money.format(data?.summary.income || 0)} icon={<ArrowUpCircle size={19} />} bgColor="#059669" />
          <StatCard title="Total Pengeluaran" value={loading ? "-" : money.format(data?.summary.expense || 0)} icon={<ArrowDownCircle size={19} />} bgColor="#dc2626" />
          <StatCard title="Saldo Kas" value={loading ? "-" : money.format(data?.summary.balance || 0)} icon={<Wallet size={19} />} bgColor="#0F766E" />
        </section>

        <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold">Riwayat Transaksi</h3>
            <p className="text-xs text-slate-500">Maksimal 100 transaksi terbaru.</p>
          </div>
          <ResponsiveTable columns={columns} data={transactions} keyExtractor={(t) => t.id} loading={loading} loadingMessage="Memuat riwayat transaksi..." emptyMessage="Belum ada transaksi kas." />
        </section>

        {!canManage && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Anda dapat melihat ringkasan dan riwayat kas. Penambahan transaksi hanya tersedia untuk Ketua dan Bendahara.
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingId(null); }}
          title={editingId ? "Edit Transaksi Kas" : "Tambah Transaksi"}
          description={editingId ? "Perbarui rincian transaksi kas ini." : "Catat pemasukan atau pengeluaran kas."}
          size="md"
        >
          <form onSubmit={saveTransaction} className="space-y-4">
            <Field label="Jenis Transaksi">
              <select required value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as "INCOME" | "EXPENSE" })} className="field">
                <option value="INCOME">Pemasukan</option>
                <option value="EXPENSE">Pengeluaran</option>
              </select>
            </Field>
            <Field label="Kategori">
              <input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Contoh: Iuran Wajib" className="field" />
            </Field>
            <Field label="Nominal (Rp)">
              <input required min="1" step="1" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="Contoh: 50000" className="field" />
            </Field>
            <Field label="Keterangan (opsional)">
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Keterangan tambahan..." rows={3} className="field resize-y" />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditingId(null); }}>Batal</Button>
              <Button type="submit">{editingId ? "Simpan Perubahan" : "Simpan Transaksi"}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
