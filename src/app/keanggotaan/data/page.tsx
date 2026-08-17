"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Search, UserPlus, Eye, Pencil, Trash2, X } from "lucide-react";
import { DashboardShell, type SessionUser } from "@/components/DashboardShell";
import { confirmAction, showError, showSuccess } from "@/components/AlertProvider";
import Avatar from "@/components/Avatar";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import ResponsiveTable from "@/components/ResponsiveTable";

type Member = { id:string; memberId:string; fullName:string; email:string; gender:"L"|"P"; birthPlace:string|null; birthDate:string|null; phoneWa:string; dusun:string; rt:string; rw:string; address:string|null; education:string|null; occupation:string|null; section:string|null; joinDate:string; role:string; memberStatus:string; avatarUrl:string|null };
type Form = { id?:string; fullName:string; email:string; gender:"L"|"P"; birthPlace:string; birthDate:string; phoneWa:string; dusun:string; rt:string; rw:string; address:string; education:string; occupation:string; section:string; joinDate:string; memberStatus:"AKTIF"|"NON_AKTIF"; role:"KETUA"|"SEKRETARIS"|"BENDAHARA"|"ANGGOTA"; avatarFile:File|null };
const initial:Form = { fullName:"", email:"", gender:"L", birthPlace:"", birthDate:"", phoneWa:"", dusun:"Kemitir", rt:"", rw:"", address:"", education:"", occupation:"", section:"", joinDate:"", memberStatus:"AKTIF", role:"ANGGOTA", avatarFile:null };
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle:"medium" });
const formatDate = (v:string|null) => v && !Number.isNaN(new Date(v).getTime()) ? dateFormat.format(new Date(v)) : "-";
const roleLabel = (v:string) => ({ KETUA:"Ketua", SEKRETARIS:"Sekretaris", BENDAHARA:"Bendahara", ANGGOTA:"Anggota" }[v] || v);

export default function MembersPage(){
 const [members,setMembers]=useState<Member[]>([]),[query,setQuery]=useState(""),[user,setUser]=useState<SessionUser|null>(null),[form,setForm]=useState(initial),[selected,setSelected]=useState<Member|null>(null),[modal,setModal]=useState<"add"|"edit"|"detail"|null>(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 async function load(){const r=await fetch("/api/members",{cache:"no-store"});const d=await r.json() as {members?:Member[];message?:string};if(!r.ok){await showError(d.message||"Data anggota gagal dimuat.");return false}setMembers(d.members||[]);return true}
 useEffect(()=>{let active=true;Promise.all([fetch("/api/members",{cache:"no-store"}),fetch("/api/auth/session")]).then(async([mr,sr])=>{const md=await mr.json() as {members?:Member[];message?:string},sd=await sr.json() as {user?:SessionUser};if(!active)return;if(!mr.ok)await showError(md.message||"Data anggota gagal dimuat.");else setMembers(md.members||[]);setUser(sd.user||null);setLoading(false)}).catch(()=>{if(active){setLoading(false);void showError("Data anggota gagal dimuat.")}});return()=>{active=false}},[]);
 useEffect(()=>{if(!modal)return;const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setModal(null)};document.addEventListener("keydown",close);return()=>document.removeEventListener("keydown",close)},[modal]);
 const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return q?members.filter(m=>`${m.fullName} ${m.memberId} ${m.email} ${m.phoneWa}`.toLowerCase().includes(q)):members},[members,query]);
 const set=(key:keyof Form,value:string|File|null)=>setForm(f=>({...f,[key]:value}));

 function openAddModal() {
   setForm(initial);
   setModal("add");
 }

 function openEditModal(m: Member) {
   setSelected(m);
   setForm({
     id: m.id,
     fullName: m.fullName,
     email: m.email,
     gender: m.gender,
     birthPlace: m.birthPlace || "",
     birthDate: m.birthDate ? m.birthDate.split("T")[0] : "",
     phoneWa: m.phoneWa,
     dusun: m.dusun || "Kemitir",
     rt: m.rt || "",
     rw: m.rw || "",
     address: m.address || "",
     education: m.education || "",
          occupation: m.occupation || "",
     section: m.section || "",
     joinDate: m.joinDate ? m.joinDate.split("T")[0] : "",
     memberStatus: (m.memberStatus as "AKTIF" | "NON_AKTIF") || "AKTIF",
     role: (m.role as "KETUA" | "SEKRETARIS" | "BENDAHARA" | "ANGGOTA") || "ANGGOTA",
     avatarFile: null,
   });
   setModal("edit");
 }

 async function edit(e: FormEvent) {
   e.preventDefault();
   if (!form.id) return;
   setSaving(true);
   try {
     const data = new FormData();
     Object.entries(form).forEach(([key, value]) => {
       if (key !== "avatarFile" && typeof value === "string") data.append(key, value);
     });
     if (form.avatarFile) data.append("avatar", form.avatarFile);
     const r = await fetch("/api/members", { method: "PATCH", body: data });
     const d = await r.json() as { message?: string };
     if (!r.ok) { await showError(d.message || "Data anggota gagal diperbarui."); return; }
     await showSuccess("Data anggota berhasil diperbarui.");
     setModal(null);
     await load();
   } catch {
     await showError("Terjadi kesalahan sistem saat memperbarui data anggota.");
   } finally {
     setSaving(false);
   }
 }

 async function remove(m: Member) {
   if (!await confirmAction("Hapus Anggota?", `Apakah Anda yakin ingin menghapus anggota ${m.fullName}? Data yang dihapus tidak dapat dikembalikan.`)) return;
   try {
     const r = await fetch(`/api/members?id=${m.id}`, { method: "DELETE" });
     const d = await r.json() as { message?: string };
     if (!r.ok) { await showError(d.message || "Anggota gagal dihapus."); return; }
     await showSuccess("Anggota berhasil dihapus.");
     await load();
   } catch {
     await showError("Terjadi kesalahan sistem saat menghapus anggota.");
   }
 }
 async function add(e:FormEvent){e.preventDefault();setSaving(true);try{const data=new FormData();Object.entries(form).forEach(([key,value])=>{if(key!=="avatarFile"&&key!=="id"&&typeof value==="string")data.append(key,value)});if(form.avatarFile)data.append("avatar",form.avatarFile);const r=await fetch("/api/members",{method:"POST",body:data}),d=await r.json() as {message?:string};if(!r.ok){await showError(d.message||"Anggota gagal ditambahkan.");return}setModal(null);setForm({...initial});await load();await showSuccess("Anggota berhasil ditambahkan.")}catch{await showError("Anggota gagal ditambahkan. Periksa koneksi Anda.")}finally{setSaving(false)}}
 const canManage=!!user&&["KETUA","SEKRETARIS"].includes(user.role);
 const canDelete=!!user&&["KETUA","SEKRETARIS"].includes(user.role);

 const columns = [
   {
     key: "member",
     header: "Anggota",
     render: (m: Member) => (
       <div className="flex items-center gap-3">
         <Avatar member={m} small />
         <div>
           <p className="font-semibold">{m.fullName}</p>
           <p className="font-mono text-xs text-slate-500">{m.memberId}</p>
         </div>
       </div>
     ),
   },
   {
     key: "contact",
     header: "Kontak",
     render: (m: Member) => (
       <>
         {m.email}
         <br />
         <span className="text-xs">{m.phoneWa}</span>
       </>
     ),
   },
   {
     key: "region",
     header: "Wilayah",
     render: (m: Member) => (
       <>
         Dusun {m.dusun}
         <br />
         <span className="text-xs">RT {m.rt} / RW {m.rw}</span>
       </>
     ),
   },
   {
     key: "role",
     header: "Role",
     render: (m: Member) => roleLabel(m.role),
   },
   {
     key: "section",
     header: "Seksi/Jabatan",
     render: (m: Member) => m.section || "-",
   },
   {
     key: "status",
     header: "Status",
     render: (m: Member) => (
       <span
         className={`rounded-full px-2 py-1 text-xs ${
           m.memberStatus === "AKTIF"
             ? "bg-emerald-50 text-emerald-700"
             : "bg-slate-100 text-slate-600"
         }`}
       >
         {m.memberStatus === "AKTIF" ? "Aktif" : "Nonaktif"}
       </span>
     ),
   },
   {
     key: "action",
     header: "Aksi",
     className: "text-right",
     render: (m: Member) => (
       <div className="flex items-center justify-end gap-1.5">
         <button
           title="Lihat Detail"
           onClick={() => { setSelected(m); setModal("detail"); }}
           className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
         >
           <Eye size={15} />
         </button>
         {user && (m.id === user.id || user.role === "KETUA") && (
           <button
             title="Edit Data Anggota"
             onClick={() => openEditModal(m)}
             className="rounded-lg border border-teal-200 p-1.5 text-teal-600 hover:bg-teal-50 transition"
           >
             <Pencil size={15} />
           </button>
         )}
         {canDelete && m.id !== user?.id && (
           <button
             title="Hapus Anggota"
             onClick={() => remove(m)}
             className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 transition"
           >
             <Trash2 size={15} />
           </button>
         )}
       </div>
     ),
   },
 ];

 return (
   <DashboardShell title="Data Anggota">
     <div className="space-y-5">
       <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
         <div>
           <h2 className="text-xl font-bold">Data Anggota</h2>
           <p className="text-sm text-slate-500">Seluruh data dan detail anggota TUNAS HARAPAN.</p>
         </div>
         {canManage && (
           <Button onClick={openAddModal}>
             <UserPlus size={17} /> Tambah Anggota
           </Button>
         )}
       </div>

       <section className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
         <div className="relative mb-4">
           <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
           <input
             value={query}
             onChange={e => setQuery(e.target.value)}
             placeholder="Cari nama, ID, email, atau WhatsApp..."
             className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
           />
         </div>

         <ResponsiveTable
           columns={columns}
           data={filtered}
           keyExtractor={(m) => m.id}
           loading={loading}
           loadingMessage="Memuat data anggota..."
           emptyMessage="Data anggota belum ditemukan."
         />
       </section>
     </div>

     {modal === "detail" && selected && (
       <DetailModal member={selected} close={() => { setModal(null); setSelected(null); }} />
     )}

     <Modal
       isOpen={modal === "add" || modal === "edit"}
       onClose={() => setModal(null)}
       title={modal === "add" ? "Tambah Anggota" : "Edit Data Anggota"}
       description={modal === "add" ? "Lengkapi data anggota sesuai database." : `Perbarui data untuk ${selected?.fullName || "anggota"}.`}
       size="lg"
     >
       <form onSubmit={modal === "add" ? add : edit} className="space-y-5">
         <div>
           <h3 className="mb-3 text-sm font-bold">Identitas Anggota</h3>
           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
             <Field label="Name lengkap"><input required maxLength={100} value={form.fullName} onChange={e=>set("fullName",e.target.value)} className="field"/></Field>
             <Field label="Email"><input required type="email" maxLength={100} value={form.email} onChange={e=>set("email",e.target.value)} className="field"/></Field>
             <Field label="Jenis kelamin"><select value={form.gender} onChange={e=>set("gender",e.target.value)} className="field"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></Field>
             <Field label="Nomor WhatsApp"><input required type="tel" maxLength={20} value={form.phoneWa} onChange={e=>set("phoneWa",e.target.value)} className="field"/></Field>
             <Field label="Tempat lahir"><input maxLength={50} value={form.birthPlace} onChange={e=>set("birthPlace",e.target.value)} className="field"/></Field>
             <Field label="Tanggal lahir"><input type="date" value={form.birthDate} onChange={e=>set("birthDate",e.target.value)} className="field"/></Field>
           </div>
         </div>
         <div>
           <h3 className="mb-3 text-sm font-bold">Alamat dan Keanggotaan</h3>
           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
             <Field label="Dusun"><input maxLength={50} value={form.dusun} onChange={e=>set("dusun",e.target.value)} className="field"/></Field>
             <Field label="RT"><input required maxLength={5} value={form.rt} onChange={e=>set("rt",e.target.value)} className="field"/></Field>
             <Field label="RW"><input required maxLength={5} value={form.rw} onChange={e=>set("rw",e.target.value)} className="field"/></Field>
             <Field label="Pendidikan"><input maxLength={30} value={form.education} onChange={e=>set("education",e.target.value)} className="field"/></Field>
             <Field label="Pekerjaan"><input maxLength={50} value={form.occupation} onChange={e=>set("occupation",e.target.value)} className="field"/></Field>
              {user?.role === "KETUA" && (<Field label="Seksi / Jabatan Pengurus"><input maxLength={100} value={form.section} onChange={e=>set("section",e.target.value)} className="field" placeholder="cth: Humas, Perlengkapan, ..."/></Field>)}
             <Field label="Tanggal bergabung"><input type="date" value={form.joinDate} onChange={e=>set("joinDate",e.target.value)} className="field"/></Field>
              {(modal === "add" || modal === "edit") && (<Field label="Status anggota"><select value={form.memberStatus} onChange={e=>set("memberStatus",e.target.value)} className="field"><option value="AKTIF">Aktif</option><option value="NON_AKTIF">Nonaktif</option></select></Field>)}
             {(modal === "add" || modal === "edit") && (<Field label="Role"><select value={form.role} onChange={e=>set("role",e.target.value)} className="field"><option value="ANGGOTA">Anggota</option><option value="KETUA">Ketua</option><option value="SEKRETARIS">Sekretaris</option><option value="BENDAHARA">Bendahara</option></select></Field>)}
             <Field label="Alamat lengkap" wide><textarea rows={3} maxLength={1000} value={form.address} onChange={e=>set("address",e.target.value)} className="field resize-y"/></Field>
             <Field label="Foto profil" wide><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>set("avatarFile",e.target.files?.[0]||null)} className="field file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-teal-700"/><p className="mt-1 text-[11px] text-slate-500">{modal === "edit" ? "Biarkan kosong jika tidak ingin mengubah foto profil." : "JPG, PNG, WebP, atau GIF. Maksimal 5 MB."}</p></Field>
           </div>
         </div>
         <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
           <Button type="button" variant="secondary" onClick={() => setModal(null)}>Batal</Button>
           <Button type="submit" loading={saving}>{modal === "add" ? "Simpan Anggota" : "Perbarui Anggota"}</Button>
         </div>
       </form>
     </Modal>
   </DashboardShell>
 );
}

function DetailModal({ member, close }: { member: Member; close: () => void }) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const item = (label: string, value: string | null | undefined) => (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">{value || "-"}</p>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={close} title={member.fullName} description={member.memberId}>
      <div className="flex items-center gap-3 mb-6">
        {member.avatarUrl ? (
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); setPhotoOpen(true); }}
            className="flex-shrink-0 cursor-pointer rounded-full ring-2 ring-slate-200 transition hover:ring-teal-400 focus:outline-none focus:ring-teal-500 touch-manipulation min-h-[44px] min-w-[44px] p-0"
          >
            <img
              src={member.avatarUrl}
              alt={`Foto ${member.fullName}`}
              className="h-14 w-14 rounded-full object-cover"
              draggable={false}
            />
          </button>
        ) : (
          <Avatar member={member} />
        )}
        <div>
          <h2 className="text-lg font-bold">{member.fullName}</h2>
          <p className="font-mono text-xs text-slate-500">{member.memberId}</p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {item("Jenis kelamin", member.gender === "P" ? "Perempuan" : "Laki-laki")}
        {item("Tempat, tanggal lahir", [member.birthPlace, formatDate(member.birthDate)].filter(Boolean).join(", ") || "-")}
        {item("Email", member.email)}
        {item("WhatsApp", member.phoneWa)}
        {item("Alamat", [member.address, `Dusun ${member.dusun}`, `RT ${member.rt} / RW ${member.rw}`].filter(Boolean).join(", "))}
        {item("Pendidikan", member.education)}
        {item("Pekerjaan", member.occupation)}
        {item("Seksi / Jabatan", member.section)}
        {item("Tanggal bergabung", formatDate(member.joinDate))}
        {item("Role", roleLabel(member.role))}
        {item("Status anggota", member.memberStatus === "AKTIF" ? "Aktif" : "Nonaktif")}
      </div>

      {/* Photo lightbox */}
      {photoOpen && member.avatarUrl && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onPointerDown={(e) => { if (e.target === e.currentTarget) setPhotoOpen(false); }}
        >
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); setPhotoOpen(false); }}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 shadow-lg transition hover:bg-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup foto"
          >
            <X size={20} />
          </button>
          <img
            src={member.avatarUrl}
            alt={`Foto ${member.fullName}`}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onPointerDown={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}
    </Modal>
  );
}
