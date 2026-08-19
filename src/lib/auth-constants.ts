import type { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
    KETUA: "Ketua",
  SEKRETARIS: "Sekretaris",
  PENGURUS: "Pengurus",
  BENDAHARA: "Bendahara",
  ANGGOTA: "Anggota",
};

export const PRIVATE_ROUTE_PREFIXES = [
  "/change-password",
  "/dashboard",
  "/keanggotaan",
  "/keuangan",
  "/inventaris",
  "/kegiatan",
  "/informasi",
];

export const ROLE_RESTRICTED_ROUTES = [
  { prefix: "/keuangan/pinjaman", roles: ["KETUA", "SEKRETARIS", "PENGURUS", "BENDAHARA"] },
  { prefix: "/informasi/moderasi-foto", roles: ["KETUA", "SEKRETARIS", "PENGURUS"] },
] as const;


