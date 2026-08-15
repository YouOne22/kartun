# SYSTEM REQUIREMENT SPECIFICATION (SRS)

## APLIKASI MANAJEMEN KARANG TARUNA "TUNAS HARAPAN" DUSUN KEMITIR

**Document Version:** 1.0.0

**Target Execution Engine:** Cline (AI Software Engineer)


---

## 0. MANDATORY AI CHANGE CONTROL & EXISTING FEATURE PROTECTION

> **CRITICAL EXECUTION RULE FOR CLINE / AI**
>
> This project is already substantially implemented. Many existing features are working and must be treated as **PROTECTED**.
>
> When the user requests a revision, bug fix, UI adjustment, or new development, **DO NOT modify anything outside the requested scope and its directly required technical relations.**

### 0.1 Golden Rule

**ONLY CHANGE:**

```text
WHAT THE USER REQUESTED
+
THE MINIMUM DIRECT RELATIONS REQUIRED TO MAKE THAT REQUEST WORK
+
NECESSARY VERIFICATION / TEST CHANGES
```

**DO NOT CHANGE:**

```text
ANYTHING ELSE
```

The AI must not interpret a request as permission to improve, refactor, redesign, reorganize, optimize, rename, or rewrite unrelated parts of the project.

---

### 0.2 Existing Working Features Are Protected

Treat every existing working feature as **FROZEN BY DEFAULT**.

Unless the user explicitly asks for a change, DO NOT:

- Rewrite working components.
- Refactor unrelated code.
- Rename unrelated files, functions, variables, routes, database fields, or components.
- Change existing routes.
- Change existing API contracts.
- Change existing database schema.
- Change existing database relations.
- Change authentication.
- Change RBAC / role permissions.
- Change middleware.
- Change existing business logic.
- Change existing calculations or validation.
- Change existing integrations.
- Change existing package/dependencies.
- Change the existing sidebar/navigation structure.
- Change unrelated UI or pages.
- Remove existing functionality.
- Replace an existing library with another library.
- Reorganize folders without a direct requirement.
- Perform broad formatting on unrelated files.
- Fix unrelated warnings or technical debt.
- Upgrade packages unless explicitly requested or strictly required.
- Modify environment/configuration files unless strictly required.

**"It would be cleaner/better" is NOT a valid reason to change existing code.**

---

### 0.3 Revision / Bug-Fix Mode

When the user says something like:

```text
Perbaiki ...
Ubah ...
Revisi ...
Betulkan ...
Ada bug di ...
Tidak bekerja ...
Tampilan bagian ... diperbaiki
```

enter **REVISION MODE**.

In Revision Mode:

1. Identify the exact feature/component mentioned by the user.
2. Locate the existing implementation.
3. Identify only its direct dependencies and relations.
4. Modify only those files/code paths.
5. Preserve all unrelated behavior.
6. Test the requested behavior.
7. Check that the change did not affect unrelated functionality.
8. STOP when the requested revision is complete.

### Example

User:

> "Perbaiki form tambah anggota agar validasi nomor WhatsApp bekerja."

Allowed:

```text
Form Tambah Anggota
→ validation logic
→ directly related schema/type if required
→ directly related API validation if required
→ necessary test
```

Not allowed:

```text
Dashboard
Sidebar
Keuangan
Inventaris
QR Absensi
PDF
Chat
Authentication
Database tables unrelated to member validation
```

---

### 0.4 Development / New Feature Mode

When the user explicitly asks for a **new feature or development**, enter **DEVELOPMENT MODE**.

A new feature must preferably be implemented **additively**.

Use this approach:

```text
NEW REQUEST
    ↓
New component/module where possible
    ↓
New API only if required
    ↓
New database table/field only if required
    ↓
Minimal integration with existing system
    ↓
Test new feature
    ↓
Verify existing related functionality
    ↓
STOP
```

Do not rewrite an existing feature merely to introduce a new feature.

### Example

User:

> "Tambahkan fitur polling/voting."

Allowed:

```text
Polling UI
Polling API
Polling database relations
Polling permissions if required
Polling navigation entry if explicitly required
```

Not allowed:

```text
Rewrite member management
Rewrite finance
Rewrite inventory
Rewrite QR attendance
Rewrite authentication
Rewrite existing dashboard
```

---

### 0.5 Direct Relation Rule

A file/component/module may only be changed when it is:

1. The exact target of the user's request, OR
2. A direct technical dependency that must change for the request to function, OR
3. A necessary test/verification file.

If a related file **does not actually need to change**, DO NOT touch it.

Example:

```text
Requested:
"Ubah warna tombol Simpan pada Form Anggota."

Allowed:
- Form Anggota styling
- Local design class/token if required

Not allowed:
- Global theme rewrite
- Sidebar styling
- Dashboard redesign
- Login redesign
- Database changes
```

If a global token would affect unrelated features, prefer a **local style change**.

---

### 0.6 Scope Inspection Before Editing

Before modifying code, Cline MUST determine:

```text
1. WHAT is the user asking to change?
2. WHERE is that feature implemented?
3. WHICH files are directly involved?
4. WHICH dependencies are actually required?
5. WHAT existing behavior must remain untouched?
```

Create an internal scope boundary:

```text
IN SCOPE:
- [requested file/component]
- [direct dependency if required]
- [required test]

OUT OF SCOPE:
- Everything else
```

Do not expand the scope without a technical reason directly tied to the user's request.

If the request is ambiguous and a broad interpretation could affect existing features, **ask for clarification instead of making broad changes**.

---

### 0.7 No Unrequested Refactoring

Cline MUST NOT perform opportunistic refactoring.

Do not:

- "Clean up" unrelated code.
- Convert architecture.
- Rewrite old components.
- Rename things for consistency.
- Split components unnecessarily.
- Merge components unnecessarily.
- Replace state management.
- Replace CSS architecture.
- Replace libraries.
- Introduce a new framework.
- Remove code because it appears unused.
- Optimize unrelated queries.
- Optimize unrelated rendering.
- Rewrite APIs for style reasons.

If unrelated technical debt is discovered:

> **LEAVE IT UNTOUCHED and report it separately.**

---

### 0.8 No Unrequested Database Changes

Database changes are considered **HIGH RISK**.

Only change the database when the user's requested feature actually requires it.

If a database change is required:

1. Change only the required table/field/relation.
2. Preserve existing fields.
3. Preserve existing relations.
4. Do not rename or delete existing fields unless explicitly requested.
5. Use a proper migration.
6. Verify the affected queries/API.
7. Do not perform unrelated schema cleanup.

Never use an unrelated feature request as an opportunity to redesign the database.

---

### 0.9 API Contract Protection

Existing API contracts are protected.

Do not change existing:

- Endpoint paths
- HTTP methods
- Request payload structure
- Response structure
- Authentication requirements
- Error behavior

unless the requested task explicitly requires it.

If an API change is unavoidable, prefer a **backward-compatible** implementation.

---

### 0.10 Authentication & RBAC Protection

The existing authentication and RBAC system must be treated as protected infrastructure.

Do not change:

- Login flow
- Session/JWT behavior
- Password behavior
- Middleware
- Role definitions
- Permission matrix
- Route guards

while working on an unrelated feature.

Only modify these when:

1. The user explicitly requests it, OR
2. The requested feature genuinely requires a related access-control change.

---

### 0.11 Sidebar / Navigation Protection

The existing sidebar and navigation structure are protected.

> **DO NOT redesign, reorder, rename, remove, or restructure the existing sidebar/navigation unless the user explicitly requests it.**

A new feature may add a navigation entry only when that is explicitly required/requested.

Do not use a new feature request as an excuse to redesign existing navigation.

---

### 0.12 Existing Error Protection

If Cline discovers an error unrelated to the current task:

```text
DO NOT FIX IT AUTOMATICALLY.
```

Instead:

1. Continue with the requested task if possible.
2. Do not modify unrelated files to make the build "clean".
3. Report the unrelated error separately.

If an error existed before the current change, classify it as:

```text
PRE-EXISTING ISSUE
```

and do not silently alter unrelated code to fix it.

---

### 0.13 Verification Must Be Scope-Aware

After implementation, verify:

```text
✓ Requested change works.
✓ Directly related functionality still works.
✓ Existing protected behavior remains intact.
✓ No unrelated files were modified unnecessarily.
```

Use `git diff`, file comparison, or equivalent inspection when available.

The goal is not:

> "Change as much as possible until the project is perfect."

The goal is:

> **"Make the requested change with the smallest safe change set."**

---

### 0.14 Mandatory Change Summary

At the end of every revision/development task, Cline must report:

```text
REQUEST:
[exact user request]

CHANGED:
- file/path — reason
- file/path — reason

DIRECT RELATIONS TOUCHED:
- relation/dependency — why it was required

NOT CHANGED:
- existing unrelated features intentionally left untouched

VERIFICATION:
- test/check performed
- result

UNRELATED ISSUES FOUND:
- [if any]
- intentionally not modified because they are outside scope
```

Keep the report concise.

---

### 0.15 Stop Condition

Once the requested task is:

```text
IMPLEMENTED
+
VERIFIED
```

**STOP EDITING.**

Do not continue with:

- Additional improvements
- Refactoring
- UI polishing outside scope
- Performance optimization outside scope
- Dependency upgrades
- Code cleanup
- "While I'm here" changes

If Cline sees another improvement opportunity, report it as an **OPTIONAL FOLLOW-UP**, but do not implement it.

---

### 0.16 Safe Change Formula

Every change must satisfy:

```text
USER REQUEST
    +
DIRECT TECHNICAL RELATION
    +
NECESSARY VERIFICATION
    =
ALLOWED CHANGE
```

Anything outside that formula is **OUT OF SCOPE**.

---

### 0.17 Final Safety Rule

> **Jangan menyentuh fitur lain yang sudah berjalan.**
>
> **Jangan mengedit sesuatu yang tidak diminta.**
>
> **Jangan melakukan refactor tanpa permintaan.**
>
> **Jangan memperbaiki bug yang tidak berhubungan dengan task yang sedang dikerjakan.**
>
> **Jika pengembangan fitur baru diminta, tambahkan secara minimal dan pertahankan seluruh fitur lama.**
>
> **Jika revisi diminta, ubah hanya bagian yang diminta beserta relasi teknis yang memang diperlukan.**
>
> **Setelah selesai dan berhasil diverifikasi, berhenti.**


**System Type:** Responsive Web Application / Progressive Web App (PWA)

**Organization:** Karang Taruna "TUNAS HARAPAN"

**Location Scope:** Dusun Kemitir

---

## 1. SYSTEM OVERVIEW & ARCHITECTURE

### 1.1 Technical Stack Recommendation

* **Frontend:** React / Next.js (App Router), Tailwind CSS, Lucide React (Icons), HTML5 QR Code Scanner (`html5-qrcode`).
* **Backend & Database:** Node.js / Next.js API Routes, PostgreSQL (or Supabase/Firebase) with Prisma ORM.
* **Storage:** S3-compatible / Supabase Storage / Cloudinary.
* **Export Engine:** `jspdf` & `html2canvas` for PDF report generation.

### 1.2 Image Processing Pipeline

* **Upload Format:** Any image (JPG/PNG/HEIC).
* **Processing Rule:** Convert client-side/server-side to **WebP format (Quality: 80–85%)**.
* **Dimension Rule:** Max width/height constrained to **2048px (2K resolution)**.
* **Thumbnail Generation:** Create a secondary thumbnail version (max width **300px**, target size ~50-100KB) for fast list views. Full HD version (~1–2MB) retained for gallery full-view, PDF reports, and downloads.

---

## 2. UI/UX DESIGN SYSTEM (SOFT LIGHT GLASSMORPHISM)

### 2.1 Design Tokens

* **Primary Teal:** `#0F766E` (Buttons, Active States, Accent)
* **Secondary Teal:** `#14B8A6` (Highlights, Badges)
* **Warning / Pending:** `#F59E0B` (Amber status)
* **Danger / Reject:** `#EF4444` (Red status/actions)
* **Page Background:** `#F8FAFC` (Slate 50)
* **Glass Card Panel:** `#FFFFFF` with `85%` opacity, `backdrop-filter: blur(12px)`, border `1px solid rgba(255, 255, 255, 0.7)`
* **Card Border Radius:** `16px` or `20px`
* **Text Main:** `#0F172A` (Slate 900)
* **Text Muted:** `#64748B` (Slate 500)

### 2.2 Global Layout & Navigation Structure

* **Header / Branding:** Display logo & text **"Karang Taruna TUNAS HARAPAN - Dusun Kemitir"**.
* **Desktop:** Fixed left sidebar navigation panel with accordion sub-menus.
* **Mobile:** Responsive layout with top bar (logo & user menu) and collapsible drawer / bottom navigation bar.

---

## 3. ROLE-BASED ACCESS CONTROL (RBAC)

### 3.1 Defined System Roles

1. `KETUA` (Ketua 1 & Ketua 2)
2. `SEKRETARIS` (Sekretaris 1 & Sekretaris 2)
3. `BENDAHARA` (Bendahara 1 & Bendahara 2)
4. `ANGGOTA` (Pemuda/Pemudi Terdaftar)
5. `PUBLIC` (Pengguna umum/Warga tanpa login)

### 3.2 Access Rights Matrix

| Feature / Module                      | PUBLIC    | ANGGOTA       | BENDAHARA 1-2 | SEKRETARIS 1-2    | KETUA 1-2         |
| ---                                   | ---       | ---           | ---           | ---               | ---               |
| **Landing Page & Public Info**        | Read      | Read          | Read          | Read              | Read              |
| **Data Anggota (Read All)**           | No        | Read          | Read          | Full Access       | Full Access       |
| **Data Anggota (Create/Edit)**        | No        | Self Profile  | No            | Full Access       | Full Access       |
| **Kas & Pengeluaran**                 | No        | Read Summary  | Full Access   | Read Only         | Read Only         |
| **Pinjaman Keuangan (View)**          | No        | No            | Full Access   | Full Access       | Full Access       |
| **Pinjaman Keuangan (Approve)**       | No        | No            | Approve/Reject| No                | Approve/Reject    |
| **Inventaris Barang (View)**          | No        | Read          | Read          | Read              | Read              |
| **Inventaris Borrowing (Apply)**      | No        | Create/View   | Create/View   | Create/View       | Create/View       |
| **Inventaris Borrowing (Approve)**    | No        | No            | No            | Approve/Reject    | Approve/Reject    |
| **Scan QR Absensi (Self)**            | No        | Execute       | Execute       | Execute           | Execute           |
| **Scan QR Absensi (Admin Scan)**      | No        | No            | No            | Execute           | Execute           |
| **Upload Dokumentasi**                | No        | Create        | Create        | Create            | Create            |
| **Moderasi Dokumentasi (Approve)**    | No        | No            | No            | Approve/Reject    | Approve/Reject    |
| **Cetak PDF Laporan Kegiatan**        | No        | Read Approved | Read Approved | Full Access       | Full Access       |

---

## 4. DATABASE SCHEMA (RELATIONAL SPECIFICATION)

```sql
-- ENUMS
CREATE TYPE role_enum AS ENUM ('KETUA', 'SEKRETARIS', 'BENDAHARA', 'ANGGOTA');
CREATE TYPE gender_enum AS ENUM ('L', 'P');
CREATE TYPE member_status_enum AS ENUM ('AKTIF', 'NON_AKTIF');
CREATE TYPE approval_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE visibility_enum AS ENUM ('PUBLIC', 'INTERNAL');
CREATE TYPE cash_type_enum AS ENUM ('INCOME', 'EXPENSE');

-- USERS / ANGGOTA TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(30) UNIQUE NOT NULL, -- Format: KT-TH-YYYY-XXX
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_default_password BOOLEAN DEFAULT TRUE,
    gender gender_enum NOT NULL,
    birth_place VARCHAR(50),
    birth_date DATE,
    phone_wa VARCHAR(20) NOT NULL,
    dusun VARCHAR(50) DEFAULT 'Kemitir',
    rt VARCHAR(5) NOT NULL,
    rw VARCHAR(5) NOT NULL,
    address TEXT,
    education VARCHAR(30),
    occupation VARCHAR(50),
    join_date DATE DEFAULT CURRENT_DATE,
    member_status member_status_enum DEFAULT 'AKTIF',
    role role_enum DEFAULT 'ANGGOTA',
    avatar_url TEXT,
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ANNOUNCEMENTS TABLE
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    visibility visibility_enum DEFAULT 'PUBLIC',
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CASH TRANSACTIONS TABLE
CREATE TABLE cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type cash_type_enum NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'Iuran', 'Donasi', 'Belanja Acara'
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FINANCIAL LOANS TABLE (Pencatatan Pinjaman Internal)
CREATE TABLE financial_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    notes TEXT,
    status approval_status_enum DEFAULT 'PENDING',
    is_settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY ITEMS TABLE
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(30) UNIQUE NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    total_qty INT NOT NULL DEFAULT 1,
    available_qty INT NOT NULL DEFAULT 1,
    condition VARCHAR(50) DEFAULT 'Baik',
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY BORROWINGS TABLE
CREATE TABLE inventory_borrowings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES inventory_items(id),
    borrower_id UUID REFERENCES users(id),
    qty INT NOT NULL DEFAULT 1,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE,
    actual_return_date DATE,
    purpose TEXT,
    status approval_status_enum DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EVENTS TABLE
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(100) NOT NULL,
    event_qr_token VARCHAR(255) UNIQUE NOT NULL, -- Used for Self-Scan
    visibility visibility_enum DEFAULT 'INTERNAL',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EVENT ATTENDANCE TABLE
CREATE TABLE event_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scan_method VARCHAR(20) DEFAULT 'SELF_SCAN', -- 'SELF_SCAN' or 'ADMIN_SCAN'
    UNIQUE(event_id, member_id)
);

-- EVENT DOCUMENTATION TABLE
CREATE TABLE event_documentations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES users(id),
    photo_url_hd TEXT NOT NULL,
    photo_url_thumb TEXT NOT NULL,
    caption TEXT,
    status approval_status_enum DEFAULT 'PENDING',
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EVENT REPORTS (NOTULEN) TABLE
CREATE TABLE event_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    notlen_text TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

---

## 5. SIDEBAR NAVIGATION ROUTING

```
├── Public / Unauthenticated
│   └── / (Landing Page + Announcements + Public Events + Login Modal)
│
├── Dashboard (Auth Required)
│   └── /dashboard
│
├── Keanggotaan
│   ├── /keanggotaan/data (Table, Search, Filter, Form Tambah)
│   └── /keanggotaan/kartu-digital (Display QR Code Anggota)
│
├── Keuangan (Akses: Bendahara & Ketua)
│   ├── /keuangan/pemasukan
│   ├── /keuangan/pengeluaran
│   ├── /keuangan/pinjaman (Khusus Pengurus)
│   └── /keuangan/laporan-kas
│
├── Inventaris
│   ├── /inventaris/data-barang
│   └── /inventaris/peminjaman (Publik Anggota: Status Peminjaman)
│
├── Kegiatan & Absensi
│   ├── /kegiatan/agenda
│   ├── /kegiatan/scan-qr (Dual Mode: Admin Scan / Self Scan)
│   ├── /kegiatan/dokumentasi (Galeri & Upload)
│   └── /kegiatan/laporan (Notulen & Export Cetak PDF)
│
└── Informasi
    ├── /informasi/pengumuman
    └── /informasi/moderasi-foto (Khusus Pengurus: Approve/Reject Upload)

```

---

## 6. DETAILED BUSINESS LOGIC & MODULE SPECIFICATION

### 6.1 Landing Page & Auth Engine

1. **Public View:**
* Unauthenticated users arriving at `/` see Karang Taruna "TUNAS HARAPAN" branding, Dusun Kemitir address, hero banner, upcoming public events, and public announcements.
* "Masuk Akun" button triggers the Glassmorphism Login Modal.


2. **Google Forms / Webhook Integration Flow:**
* Incoming webhook payload from Google Forms syncs directly to `users` table.
* Auto-generates `member_id` (e.g., `KT-TH-2026-001`).
* Sets default password hash to `Dusun2026` and `is_default_password = TRUE`.
* Generates a unique string for `qr_code_token`.


3. **First-Time Login Force Password Change:**
* If `is_default_password == TRUE` upon successful login, block access to Dashboard and redirect to `/change-password`. User must set a new password before continuing.


4. **Password Reset:**
* Provide option 1: "Reset via WA Automations" (Redirects to WhatsApp admin with pre-filled message).
* Provide option 2: "Hubungi Sekretaris" (Displays contact cards for Sekretaris 1 & 2).



### 6.2 Data Anggota Form & Management

* **Form Inputs (as specified in UI design):**
* Nama Lengkap (`required`)
* Email (`required`)
* Jenis Kelamin (Dropdown: Laki-laki / Perempuan)
* Tempat Lahir & Tanggal Lahir (Native Datepicker)
* No. WhatsApp (`required`, used for primary contact)
* Dusun (Default: "Kemitir")
* RT & RW (`required`)
* Alamat Lengkap (`textarea`)
* Pendidikan (Dropdown: SD/SMP/SMA/D3/S1/Lainnya)
* Pekerjaan (`input text`)
* Tanggal Bergabung (Native Datepicker)
* Status Anggota (Dropdown: Aktif / Non-Aktif)
* Role (Dropdown: Ketua, Sekretaris, Bendahara, Anggota)
* Foto Profil (Image Upload $\rightarrow$ auto compressed to WebP)


* **Auto-generated Fields:**
* System generates ID & QR Code automatically upon save.



### 6.3 Financial & Money Loans Module

* **Cash Management:** Standard double-entry recording (Income vs Expense). Real-time total calculation.
* **Money Loans (`financial_loans`):**
* Strictly hidden from `ANGGOTA` role. Visible only to `BENDAHARA`, `SEKRETARIS`, and `KETUA`.
* Simple tracking of internal loans, due dates, and repayment status (`is_settled`).



### 6.4 Inventory & Borrowing System

* **Data Barang:** List of assets owned by Karang Taruna "TUNAS HARAPAN" (e.g., Tenda, Sound System, Kursi).
* **Public Visibility:** All members (`ANGGOTA`) can view the borrowing status list so everyone knows who currently possesses specific inventory items.
* **Borrowing Flow:** Member submits borrow request $\rightarrow$ Status `PENDING` $\rightarrow$ `SEKRETARIS` or `KETUA` clicks `APPROVE` $\rightarrow$ `available_qty` decreases. On return, admin marks as returned $\rightarrow$ `available_qty` restored.

### 6.5 Dual-Mode QR Code Attendance System

* **Mode A (Admin Scan):**
* `SEKRETARIS` opens `/kegiatan/scan-qr?mode=admin`.
* Camera activates to scan QR codes on members' digital cards.
* System records `event_attendances` record with `scan_method = 'ADMIN_SCAN'`.


* **Mode B (Self Scan):**
* `SEKRETARIS` displays event QR code (generated dynamically on event page) on screen/projector/printout.
* Member opens `/kegiatan/scan-qr?mode=self` on their own mobile device, scans the displayed Event QR code.
* System records `event_attendances` record with `scan_method = 'SELF_SCAN'`.



### 6.6 Media Upload & Moderation Pipeline

1. Member uploads activity photo via `/kegiatan/dokumentasi`.
2. Client-side canvas resizes photo to max 2048px width, converts to WebP (80% quality), generates thumbnail (300px WebP).
3. Record inserted into `event_documentations` with status `PENDING`.
4. `SEKRETARIS` / `KETUA` checks `/informasi/moderasi-foto`.
* **Approve:** Photo becomes visible in public event gallery & eligible for PDF reports.
* **Reject:** Admin enters `rejection_reason`. Photo hidden from public/gallery view.



### 6.7 PDF Activity Report Generator (`/kegiatan/laporan`)

* **Trigger:** Click "Cetak PDF" button on selected activity.
* **Compiled Layout Structure:**
* **Header:** Official Letterhead:
`KARANG TARUNA "TUNAS HARAPAN"`
`DUSUN KEMITIR`
* **Section 1:** Activity Information (Title, Date, Location, Organizer).
* **Section 2:** Notulen / Event Summary Minutes.
* **Section 3:** Attendance Summary Table (Total Present, List of Names).
* **Section 4:** Documentation Photos Grid (Only images with status `APPROVED`).
* **Section 5:** Signature Block (Digital signature slots for Ketua, Sekretaris, and Event Person-in-Charge).



---

## 7. GOOGLE FORMS WEBHOOK INTEGRATION PAYLOAD (REFERENCE)

When setting up Google Apps Script on the Google Sheet connected to GForm, send a `POST` request to `/api/webhooks/gform-member-import` with JSON payload:

```json
{
  "secret_key": "YOUR_CONFIGURED_WEBHOOK_SECRET",
  "full_name": "Budi Santoso",
  "email": "budi@example.com",
  "gender": "L",
  "birth_place": "Pati",
  "birth_date": "2002-08-17",
  "phone_wa": "081234567890",
  "rt": "02",
  "rw": "01",
  "address": "Dusun Kemitir RT 02 RW 01",
  "education": "SMA",
  "occupation": "Karyawan Private"
}

```

---

## 8. DEFINITION OF DONE FOR CLINE

1. **Database:** All tables and relationships created via Prisma/SQL migrations.
2. **Auth System:** Working JWT/Session authentication with default password enforcement & RBAC protection middleware on all routes.
3. **Responsive UI:** Glassmorphism dashboard layout working seamlessly on Mobile (360px+) and Desktop (1920px).
4. **QR Attendance:** Fully working HTML5 camera scanner for both Admin Scan and Self Scan modes.
5. **PDF Export:** PDF Laporan Kegiatan generates cleanly formatted document containing metadata, notulen, attendance table, approved photos, and signature section.
6. **Brand Integration:** App text consistently reflects **Karang Taruna "TUNAS HARAPAN" Dusun Kemitir**.



--------------------------------------------------------------------------------


## ADDENDUM PRD: FITUR TAMBAHAN & MODUL TAHAP 2

### Karang Taruna "TUNAS HARAPAN" - Dusun Kemitir

---

### 1. INTEGRASI SWEETALERT2 (UI DIALOG & NOTIFIKASI)

#### 1.1 Technical Setup

* Install package: `npm install sweetalert2 sweetalert2-react-content`
* Semua panggilan `alert()`, `confirm()`, dan `prompt()` bawaan browser wajib diganti menggunakan SweetAlert2 (`Swal.fire`).

#### 1.2 Custom Styling Tokens (Glassmorphism)

```css
/* Konfigurasi Visual SweetAlert2 */
.swal2-popup {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(12px) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.7) !important;
  color: #0F172A !important;
}
.swal2-styled.swal2-confirm {
  background-color: #0F766E !important; /* Primary Teal */
  border-radius: 10px !important;
}
.swal2-styled.swal2-cancel {
  background-color: #EF4444 !important; /* Red Danger */
  border-radius: 10px !important;
}

```

#### 1.3 Rules Implementsi:

1. **Konfirmasi Hapus/Batal:** Menggunakan `Swal.fire` tipe `warning` dengan tombol konfirmasi dan batal.
2. **Form Input Alasan Penolakan:** Menggunakan `Swal.fire` dengan `input: 'textarea'` saat pengurus menolak foto dokumentasi atau pengajuan pinjaman.
3. **Pesan Sukses/Gagal:** Menggunakan `Swal.fire` tipe `success` atau `error` setelah eksekusi API (Simpan Data, Scan QR, Edit Profil).

---

### 2. MODUL REALTIME CHAT & FORUM DISKUSI

#### 2.1 Fitur

* **Forum Umum (All Member):** Ruang obrolan santai dan diskusi seluruh pemuda Dusun Kemitir.
* **Chat Khusus Acara (Panitia):** Ruang obrolan otomatis yang terhubung ke masing-masing ID Kegiatan untuk koordinasi seksi acara.
* **Engine Realtime:** Memanfaatkan fitur **Supabase Realtime Subscriptions** agar pesan langsung muncul tanpa refresh halaman.

#### 2.2 Schema Database tambahan

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- NULL jika chat umum
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

---

### 3. MODUL KARTU ANGGOTA DIGITAL (ID CARD EXPORT)

#### 3.1 Fitur

* Halaman visual tampilan ID Card resmi Karang Taruna "TUNAS HARAPAN".
* **Elemen Kartu:** Foto Profil, Nama Lengkap, `member_id`, Jabatan/Role, serta **QR Code Unik Anggota**.
* **Fungsi Export:** Tombol "Cetak / Unduh Kartu" yang mengonversi komponen elemen kartu menjadi berkas gambar PNG atau dokumen PDF menggunakan `html2canvas` & `jspdf`.

---

### 4. MODUL GENERATOR SURAT & TEMPLATE ADMINISTRASI

#### 4.1 Fitur

* Pembuat surat resmi otomatis untuk kebutuhan Sekretaris.
* **Pilihan Template:**
1. Surat Undangan Rapat Karang Taruna.
2. Surat Permohonan Izin Tempat / Fasilitas Dusun.
3. Proposal Ringkas Kegiatan.


* **Mekanisme Kerja:** Sekretaris cukup memilih jenis surat dan mengisi form ringkas (Nama Acara, Hari/Tanggal, Waktu, Lokasi) $\rightarrow$ Sistem secara otomatis menyusun layout surat lengkap dengan Kop Resmi Karang Taruna "TUNAS HARAPAN" Dusun Kemitir, nomor surat otomatis, dan blok tanda tangan digital.

---

### 5. MODUL E-VOTING & POLLING DIGITAL

#### 5.1 Fitur

* Pemungutan suara digital yang dibuat oleh Pengurus saat rapat/musyawarah.
* **Aturan Main:** 1 Akun Anggota Aktif = 1 Suara (*Single Vote Protection*).
* Hasil voting dihitung secara otomatis dan ditampilkan dalam bentuk diagram persentase *realtime* setelah periode voting ditutup.

#### 5.2 Schema Database Tambahan

```sql
CREATE TABLE pollings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE polling_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    polling_id UUID REFERENCES pollings(id) ON DELETE CASCADE,
    option_text VARCHAR(100) NOT NULL
);

CREATE TABLE polling_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    polling_id UUID REFERENCES pollings(id) ON DELETE CASCADE,
    option_id UUID REFERENCES polling_options(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(polling_id, voter_id)
);

```

---

### 6. INTEGRASI INTEGRASI GOOGLE CALENDAR

#### 6.1 Fitur

* Pada halaman Detail Agenda/Kegiatan, sediakan tombol **"Tambah ke Google Calendar"**.
* Membuka tautan URL `[https://calendar.google.com/calendar/render?action=TEMPLATE](https://calendar.google.com/calendar/render?action=TEMPLATE)...` secara otomatis dengan parameter Judul Acara, Lokasi (Dusun Kemitir), Deskripsi, serta Waktu Mulai & Selesai yang tersusun rapi.