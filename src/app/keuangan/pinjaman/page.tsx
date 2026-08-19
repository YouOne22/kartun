"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { CheckCircle2, Clock, Plus, Wallet, XCircle, Trash2 } from "lucide-react";
import { DashboardShell, type SessionUser } from "@/components/DashboardShell";
import { showError, showSuccess } from "@/components/AlertProvider";
import StatCard from "@/components/StatCard";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import ResponsiveTable from "@/components/ResponsiveTable";
import { LoanPayment } from "@prisma/client";

type Loan = {
  id: string;
  amount: number | string;
  loanDate: string;
  dueDate: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isSettled: boolean;
  settledAt: string | null;
  notes: string | null;
  borrower: { fullName: string; memberId: string };
  approver?: { fullName: string } | null;
  payments: LoanPayment[];
};

type DisplayStatus = "PENDING" | "APPROVED" | "REJECTED" | "SETTLED";

function getDisplayStatus(l: Loan): DisplayStatus {
  if (l.isSettled) return "SETTLED";
  return l.status;
}

type MemberOption = { id: string; fullName: string; memberId: string };

const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

const statusBadge: Record<DisplayStatus, { label: string; className: string }> = {
  PENDING: { label: "Menunggu", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  APPROVED: { label: "Disetujui", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  REJECTED: { label: "Ditolak", className: "bg-red-50 text-red-700 border border-red-200" },
  SETTLED: { label: "Lunas", className: "bg-teal-50 text-teal-700 border border-teal-200" },
};

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ borrowerId: "", amount: "", dueDate: "", notes: "" });
  const [payForm, setPayForm] = useState<{ loanId: string; amount: string; notes: string }>({ loanId: "", amount: "", notes: "" });
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  async function loadData() {
    const [loansRes, membersRes, sessionRes] = await Promise.all([
      fetch("/api/loans"),
      fetch("/api/members"),
      fetch("/api/auth/session"),
    ]);
    const loansJson = await loansRes.json() as { loans?: Loan[]; message?: string };
    const membersJson = await membersRes.json() as { members?: MemberOption[] };
    const sessionJson = await sessionRes.json() as { user?: SessionUser };

    if (!loansRes.ok) throw new Error(loansJson.message || "Data pinjaman gagal dimuat.");
    setLoans(loansJson.loans || []);
    setMembers(membersJson.members || []);
    setUser(sessionJson.user || null);
  }

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      loadData().catch((error: Error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  async function submitLoan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    const json = await res.json() as { message?: string };
    if (!res.ok) return showError(json.message || "Pengajuan pinjaman gagal disimpan.");
    setForm({ borrowerId: "", amount: "", dueDate: "", notes: "" });
    setIsModalOpen(false);
    showSuccess("Pinjaman berhasil dicatat!");
    loadData();
  }

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    const res = await fetch("/api/loans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json() as { message?: string };
    if (!res.ok) return showError(json.message || "Status pinjaman gagal diperbarui.");
    await loadData();
    await showSuccess(`Status pinjaman berhasil diperbarui menjadi ${status === "APPROVED" ? "Disetujui" : "Ditolak"}.`);
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLoan) return;
    setPayLoading(true);
    const res = await fetch("/api/loans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedLoan.id,
        action: "PAY",
        amount: Number(payForm.amount),
        notes: payForm.notes,
      }),
    });
    const json = await res.json() as { message?: string; partiallySettled?: boolean };
    setPayLoading(false);
    if (!res.ok) return showError(json.message || "Gagal mencatat pembayaran.");
    setSelectedLoan(null);
    setPayForm({ loanId: "", amount: "", notes: "" });
    showSuccess("Pembayaran/cicilan berhasil dicatat!");
    loadData();
  }

  async function deletePayment(paymentId: string, loanId: string) {
    const result = await Swal.fire({
      title: "Hapus Pembayaran?",
      text: "Apakah Anda yakin ingin menghapus catatan pembayaran ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    const res = await fetch("/api/loans", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, loanId }),
    });
    const json = await res.json() as { message?: string };
    if (!res.ok) return showError(json.message || "Gagal menghapus pembayaran.");
    showSuccess("Pembayaran berhasil dihapus.");
    loadData();
  }
  async function settleLoan(id: string, borrowerName: string) {
    const result = await Swal.fire({
      title: "Tandai Lunas?",
      text: `Apakah Anda yakin pinjaman atas nama ${borrowerName} sudah dilunasi?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Lunas",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0d9488",
    });
    if (!result.isConfirmed) return;
    const res = await fetch("/api/loans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "SETTLE" }),
    });
    const json = await res.json() as { message?: string };
    if (!res.ok) return showError(json.message || "Gagal menandai pinjaman sebagai lunas.");
    showSuccess("Pinjaman berhasil ditandai lunas!");
    loadData();
  }

  const canApprove = !!user && ["KETUA", "SEKRETARIS", "BENDAHARA"].includes(user.role);

  const columns = [
    { key: "borrower", header: "Peminjam", render: (l: Loan) => <div><p className="font-semibold text-slate-900">{l.borrower.fullName}</p><p className="font-mono text-xs text-slate-500">{l.borrower.memberId}</p></div> },
    {
      key: "amount",
      header: "Nominal & Cicilan",
      render: (l: Loan) => {
        const totalPaid = (l.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Number(l.amount) - totalPaid;
        return (
          <div className="space-y-1">
            <span className="font-bold text-slate-900">{money.format(Number(l.amount))}</span>
            {l.status === "APPROVED" && !l.isSettled && totalPaid > 0 && (
              <div className="text-xs text-slate-500">
                <p className="text-emerald-600 font-medium">Terbayar: {money.format(totalPaid)}</p>
                <p className="text-amber-600 font-medium">Sisa: {money.format(remaining)}</p>
              </div>
            )}
            {l.payments && l.payments.length > 0 && (
              <div className="mt-1.5 space-y-1">
                <p className="text-[11px] font-semibold text-slate-700">Riwayat Cicilan:</p>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {l.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      <span>{money.format(Number(p.amount))} ({dateFormat.format(new Date(p.paidAt))})</span>
                      {canApprove && (
                        <button onClick={() => deletePayment(p.id, l.id)} title="Hapus cicilan" className="text-red-500 hover:text-red-700 ml-1">
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    { key: "date", header: "Tanggal", render: (l: Loan) => <div><p className="text-xs">Pinjam: {dateFormat.format(new Date(l.loanDate))}</p><p className="text-xs text-slate-500">Tempo: {l.dueDate ? dateFormat.format(new Date(l.dueDate)) : "-"}</p>{l.isSettled && l.settledAt && <p className="text-xs text-teal-600">Lunas: {dateFormat.format(new Date(l.settledAt))}</p>}</div> },
    { key: "notes", header: "Keperluan", render: (l: Loan) => <span className="text-xs text-slate-600">{l.notes || "-"}</span> },
    { key: "status", header: "Status", render: (l: Loan) => { const ds = getDisplayStatus(l); return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[ds].className}`}>{statusBadge[ds].label}</span>; } },
    {
      key: "actions",
      header: "Aksi",
      render: (l: Loan) => (
        <div className="flex items-center gap-1.5">
          {canApprove && l.status === "PENDING" && !l.isSettled && (
            <>
              <button onClick={() => updateStatus(l.id, "APPROVED")} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"><CheckCircle2 size={13} /> Setuju</button>
              <button onClick={() => updateStatus(l.id, "REJECTED")} className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"><XCircle size={13} /> Tolak</button>
            </>
          )}
          {canApprove && l.status === "APPROVED" && !l.isSettled && (
            <>
              <button
                onClick={() => {
                  setPayForm({ loanId: l.id, amount: "", notes: "" });
                  setSelectedLoan(l);
                }}
                className="flex items-center gap-1 rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 transition-colors"
                title="Cicil / Bayar sebagian"
              >
                <Wallet size={13} /> Cicil
              </button>
              <button onClick={() => settleLoan(l.id, l.borrower.fullName)} className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700 transition-colors">
                Lunasi
              </button>
            </>
          )}
          {l.isSettled || l.status === "REJECTED" || (!canApprove && l.status !== "PENDING") ? (
            <span className="text-xs text-slate-400">-</span>
          ) : null}
        </div>
      ),
    },
  ];

  const pendingCount = useMemo(() => loans.filter((l) => l.status === "PENDING" && !l.isSettled).length, [loans]);
  const activeAmount = useMemo(() => loans.filter((l) => l.status === "APPROVED" && !l.isSettled).reduce((sum, l) => sum + Number(l.amount), 0), [loans]);

  return (
    <DashboardShell title="Pinjaman Keuangan">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Pinjaman Keuangan</h2>
            <p className="text-sm text-slate-500">Pencatatan dan persetujuan pinjaman internal organisasi.</p>
          </div>
          <Button onClick={() => { setForm({ borrowerId: "", amount: "", dueDate: "", notes: "" }); setIsModalOpen(true); }}>
            <Plus size={17} /> Catat Pinjaman Baru
          </Button>
        </div>

        {message && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{message}</div>}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Total Pinjaman" value={loading ? "-" : loans.length} icon={<Wallet size={19} />} bgColor="#0F766E" />
          <StatCard title="Menunggu Persetujuan" value={loading ? "-" : pendingCount} icon={<Clock size={19} />} bgColor="#d97706" />
          <StatCard title="Total Dana Dipinjamkan" value={loading ? "-" : money.format(activeAmount)} icon={<Wallet size={19} />} bgColor="#059669" />
        </section>

        <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold">Daftar Pinjaman</h3>
            <p className="text-xs text-slate-500">Riwayat pengajuan pinjaman anggota.</p>
          </div>
          <ResponsiveTable columns={columns} data={loans} keyExtractor={(l) => l.id} loading={loading} loadingMessage="Memuat daftar pinjaman..." emptyMessage="Belum ada data pinjaman." />
        </section>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Catat Pinjaman Baru"
          description="Buat catatan pengajuan atau pemberian pinjaman baru untuk anggota."
          size="md"
        >
          <form onSubmit={submitLoan} className="space-y-4">
            <Field label="Pilih Anggota Peminjam">
              <select
                required
                value={form.borrowerId}
                onChange={(e) => setForm({ ...form, borrowerId: e.target.value })}
                className="field"
              >
                <option value="">-- Pilih Anggota --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberId})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nominal Pinjaman (Rp)">
              <input
                required
                min="1"
                step="1"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Contoh: 1000000"
                className="field"
              />
            </Field>
            <Field label="Jatuh Tempo (Opsional)">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="field"
              />
            </Field>
            <Field label="Catatan / Keterangan (Opsional)">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Keperluan pinjaman..."
                className="field min-h-[80px]"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit">Simpan Pinjaman</Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={!!selectedLoan}
          onClose={() => setSelectedLoan(null)}
          title="Catat Pembayaran / Cicilan"
          description={selectedLoan ? `Peminjam: ${selectedLoan.borrower.fullName} (Total: ${money.format(Number(selectedLoan.amount))})` : ""}
          size="sm"
        >
          {selectedLoan && (
            <form onSubmit={submitPayment} className="space-y-4">
              {(() => {
                const totalPaid = (selectedLoan.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
                const remaining = Number(selectedLoan.amount) - totalPaid;
                return (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1 border border-slate-200">
                    <p>Total Pinjaman: <span className="font-semibold text-slate-900">{money.format(Number(selectedLoan.amount))}</span></p>
                    <p>Sudah Dibayar: <span className="font-semibold text-emerald-600">{money.format(totalPaid)}</span></p>
                    <p>Sisa Tagihan: <span className="font-semibold text-amber-600">{money.format(remaining)}</span></p>
                  </div>
                );
              })()}
              <Field label="Nominal Pembayaran (Rp)">
                <input
                  required
                  min="1"
                  step="1"
                  type="number"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  placeholder="Contoh: 50000"
                  className="field"
                />
              </Field>
              <Field label="Catatan / Keterangan (Opsional)">
                <input
                  type="text"
                  value={payForm.notes}
                  onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                  placeholder="Contoh: Cicilan ke-1"
                  className="field"
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setSelectedLoan(null)}>Batal</Button>
                <Button type="submit" loading={payLoading}>Simpan Pembayaran</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardShell>
  );
}