"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, ClipboardList, Package, Plus, X, Pencil, Trash2 } from "lucide-react";
import { DashboardShell, type SessionUser } from "@/components/DashboardShell";
import { confirmAction, showError, showSuccess } from "@/components/AlertProvider";
import StatCard from "@/components/StatCard";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import ResponsiveTable from "@/components/ResponsiveTable";

type Status = "PENDING" | "APPROVED" | "REJECTED";
type Item = { id: string; itemCode: string; itemName: string; totalQty: number; availableQty: number; condition: string; borrowings: { id: string; qty: number; status: Status; borrower: { fullName: string } }[] };
type Borrowing = { id: string; qty: number; status: Status; borrowDate: string; returnDate: string | null; purpose: string | null; item: { itemName: string; itemCode: string }; borrower: { fullName: string; memberId: string } };
type InventoryData = { items: Item[] };
type BorrowingData = { borrowings: Borrowing[] };

const statusStyle: Record<Status, string> = { PENDING: "bg-amber-50 text-amber-700", APPROVED: "bg-emerald-50 text-emerald-700", REJECTED: "bg-red-50 text-red-700" };
const statusLabel: Record<Status, string> = { PENDING: "Menunggu", APPROVED: "Disetujui", REJECTED: "Ditolak" };
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
function formatDate(value: string | null) { if (!value) return "-"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "-" : dateFormat.format(date); }

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [borrowForm, setBorrowForm] = useState({ itemId: "", qty: "1", returnDate: "", purpose: "" });

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState({ itemCode: "", itemName: "", totalQty: "1", condition: "Baik" });
  const [confirmModal, setConfirmModal] = useState<{ id: string; status: "APPROVED" | "REJECTED"; title: string; desc: string } | null>(null);

  async function loadData() {
    const [itemsResponse, borrowingsResponse, sessionResponse] = await Promise.all([fetch("/api/inventory"), fetch("/api/inventory/borrowings"), fetch("/api/auth/session")]);
    const itemsData = await itemsResponse.json() as InventoryData & { message?: string };
    const borrowingsData = await borrowingsResponse.json() as BorrowingData & { message?: string };
    const sessionData = await sessionResponse.json() as { user?: SessionUser };
    if (!itemsResponse.ok) throw new Error(itemsData.message || "Data inventaris gagal dimuat.");
    if (!borrowingsResponse.ok) throw new Error(borrowingsData.message || "Data peminjaman gagal dimuat.");
    setItems(itemsData.items); setBorrowings(borrowingsData.borrowings); setUser(sessionData.user || null);
    setBorrowForm((current) => ({ ...current, itemId: current.itemId || itemsData.items[0]?.id || "" }));
  }

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      loadData().catch((error: Error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = "/api/inventory";
    const method = editingItem ? "PATCH" : "POST";
    const body = editingItem
      ? { id: editingItem.id, ...itemForm, totalQty: Number(itemForm.totalQty) }
      : { ...itemForm, totalQty: Number(itemForm.totalQty) };

    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json() as { message?: string };
    if (!response.ok) return showError(data.message || "Barang gagal disimpan.");
    setItemForm({ itemCode: "", itemName: "", totalQty: "1", condition: "Baik" });
    setEditingItem(null);
    setIsAddModalOpen(false);
    await loadData();
    await showSuccess(editingItem ? "Barang berhasil diperbarui." : "Barang berhasil ditambahkan.");
  }

  async function deleteItem(id: string) {
    if (!await confirmAction("Hapus Barang?", "Barang ini akan dihapus dari inventaris.")) return;
    const response = await fetch(`/api/inventory?id=${id}`, { method: "DELETE" });
    const data = await response.json() as { message?: string };
    if (!response.ok) return showError(data.message || "Gagal menghapus barang.");
    await loadData();
    await showSuccess("Barang berhasil dihapus.");
  }

  async function requestBorrowing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/inventory/borrowings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...borrowForm, qty: Number(borrowForm.qty) }) });
    const data = await response.json() as { message?: string };
    if (!response.ok) return showError(data.message || "Pengajuan peminjaman gagal disimpan.");
    setBorrowForm((current) => ({ ...current, qty: "1", returnDate: "", purpose: "" })); await loadData(); await showSuccess("Pengajuan peminjaman berhasil dikirim.");
  }

  async function executeConfirm() {
    if (!confirmModal) return;
    const { id, status } = confirmModal;
    setConfirmModal(null);
    const response = await fetch("/api/inventory/borrowings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const data = await response.json() as { message?: string };
    if (!response.ok) return showError(data.message || "Status peminjaman gagal diperbarui.");
    await loadData(); await showSuccess(status === "APPROVED" ? "Peminjaman disetujui." : "Peminjaman ditolak.");
  }

  const canManage = !!user && ["KETUA", "SEKRETARIS"].includes(user.role);

  const borrowingColumns = [
    { key: "item", header: "Barang", render: (b: Borrowing) => (<><p className="font-semibold">{b.item.itemName}</p><p className="font-mono text-xs text-slate-500">{b.item.itemCode}</p></>) },
    { key: "borrower", header: "Peminjam", render: (b: Borrowing) => (<>{b.borrower.fullName}<p className="text-xs text-slate-500">{b.borrower.memberId}</p></>) },
    { key: "qty", header: "Jumlah", render: (b: Borrowing) => `${b.qty} unit` },
    { key: "returnDate", header: "Tanggal kembali", render: (b: Borrowing) => formatDate(b.returnDate) },
    { key: "status", header: "Status", render: (b: Borrowing) => <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyle[b.status]}`}>{statusLabel[b.status]}</span> },
    {
      key: "action",
      header: "Aksi",
      render: (b: Borrowing) =>
        canManage && b.status === "PENDING" ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setConfirmModal({ id: b.id, status: "APPROVED", title: "Setujui Peminjaman?", desc: `Anda akan menyetujui peminjaman ${b.item.itemName} oleh ${b.borrower.fullName}.` })} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2">
              <Check size={14} />
            </Button>
            <Button size="sm" variant="danger" onClick={() => setConfirmModal({ id: b.id, status: "REJECTED", title: "Tolak Peminjaman?", desc: `Anda akan menolak pengajuan peminjaman ${b.item.itemName}.` })} className="p-2">
              <X size={14} />
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <DashboardShell title="Inventaris">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Data Barang</h2>
            <p className="text-sm text-slate-500">Daftar aset Karang Taruna dan status peminjamannya.</p>
          </div>
          {canManage && (
            <Button onClick={() => { setEditingItem(null); setItemForm({ itemCode: "", itemName: "", totalQty: "1", condition: "Baik" }); setIsAddModalOpen(true); }}>
              <Plus size={17} /> Tambah Barang
            </Button>
          )}
        </div>
        {message && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{message}</div>}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Jenis Barang" value={loading ? "-" : items.length} icon={<Package size={20} />} bgColor="#0F766E" />
          <StatCard title="Pengajuan Menunggu" value={loading ? "-" : borrowings.filter((item) => item.status === "PENDING").length} icon={<ClipboardList size={20} />} bgColor="#d97706" />
          <StatCard title="Total Unit Tersedia" value={loading ? "-" : items.reduce((total, item) => total + item.availableQty, 0)} icon={<Package size={20} />} bgColor="#059669" />
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold">Daftar Inventaris</h3>
              <p className="text-xs text-slate-500">Ketersediaan unit berubah setelah peminjaman disetujui.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-100 p-4 bg-white shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.itemName}</p>
                      <p className="font-mono text-xs text-slate-500">{item.itemCode}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.availableQty ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {item.availableQty ? "Tersedia" : "Habis"}
                      </span>
                      {canManage && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            title="Edit Barang"
                            onClick={() => {
                              setEditingItem(item);
                              setItemForm({
                                itemCode: item.itemCode,
                                itemName: item.itemName,
                                totalQty: String(item.totalQty),
                                condition: item.condition
                              });
                              setIsAddModalOpen(true);
                            }}
                            className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            title="Hapus Barang"
                            onClick={() => deleteItem(item.id)}
                            className="rounded-lg border border-red-200 p-1 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-xs text-slate-500">Tersedia</p>
                      <b>{item.availableQty} / {item.totalQty} unit</b>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-xs text-slate-500">Kondisi</p>
                      <b>{item.condition}</b>
                    </div>
                  </div>
                  {item.borrowings[0] && <p className="mt-3 text-xs text-slate-500">Peminjaman terakhir: {item.borrowings[0].borrower.fullName} ({item.borrowings[0].qty} unit)</p>}
                </article>
              ))}
              {!loading && !items.length && <p className="p-8 text-center text-sm text-slate-500 sm:col-span-2">Belum ada data barang.</p>}
            </div>
          </section>

          <div className="space-y-5">
            {!canManage && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Peminjaman barang dapat diajukan melalui formulir di bawah.
              </div>
            )}

            <form onSubmit={requestBorrowing} className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList size={18} className="text-[#0F766E]" />
                <h3 className="font-bold">Ajukan Peminjaman</h3>
              </div>
              <div className="space-y-3">
                <Field label="Pilih Barang">
                  <select required value={borrowForm.itemId} onChange={(event) => setBorrowForm({ ...borrowForm, itemId: event.target.value })} className="field">
                    <option value="">Pilih barang</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>{item.itemName} ({item.availableQty} tersedia)</option>
                    ))}
                  </select>
                </Field>
                <Field label="Jumlah Unit">
                  <input required min="1" step="1" type="number" value={borrowForm.qty} onChange={(event) => setBorrowForm({ ...borrowForm, qty: event.target.value })} placeholder="1" className="field" />
                </Field>
                <Field label="Rencana Dikembalikan">
                  <input type="date" value={borrowForm.returnDate} onChange={(event) => setBorrowForm({ ...borrowForm, returnDate: event.target.value })} className="field" />
                </Field>
                <Field label="Keperluan Peminjaman (opsional)">
                  <textarea value={borrowForm.purpose} onChange={(event) => setBorrowForm({ ...borrowForm, purpose: event.target.value })} placeholder="Keperluan..." rows={3} className="field resize-y" />
                </Field>
                <Button type="submit" disabled={!items.length} className="w-full">Kirim Pengajuan</Button>
              </div>
            </form>
          </div>
        </div>

        <section className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold">Riwayat Peminjaman</h3>
            <p className="text-xs text-slate-500">Anggota melihat pengajuan sendiri; pengurus melihat seluruh pengajuan.</p>
          </div>
          <ResponsiveTable columns={borrowingColumns} data={borrowings} keyExtractor={(b) => b.id} loading={loading} loadingMessage="Memuat riwayat peminjaman..." emptyMessage="Belum ada pengajuan peminjaman." />
        </section>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }}
        title={editingItem ? "Edit Barang" : "Tambah Barang"}
        description={editingItem ? "Perbarui data aset inventaris ini." : "Lengkapi data aset inventaris baru."}
        size="md"
      >
        <form onSubmit={saveItem} className="space-y-4">
          <Field label="Kode Barang">
            <input required value={itemForm.itemCode} onChange={(event) => setItemForm({ ...itemForm, itemCode: event.target.value })} placeholder="Contoh: BRG-001" className="field" />
          </Field>
          <Field label="Nama Barang">
            <input required value={itemForm.itemName} onChange={(event) => setItemForm({ ...itemForm, itemName: event.target.value })} placeholder="Contoh: Tenda Camping" className="field" />
          </Field>
          <Field label="Jumlah Unit">
            <input required min="1" step="1" type="number" value={itemForm.totalQty} onChange={(event) => setItemForm({ ...itemForm, totalQty: event.target.value })} placeholder="1" className="field" />
          </Field>
          <Field label="Kondisi">
            <input required value={itemForm.condition} onChange={(event) => setItemForm({ ...itemForm, condition: event.target.value })} placeholder="Baik / Cukup" className="field" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsAddModalOpen(false); setEditingItem(null); }}>Batal</Button>
            <Button type="submit">{editingItem ? "Simpan Perubahan" : "Simpan Barang"}</Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
