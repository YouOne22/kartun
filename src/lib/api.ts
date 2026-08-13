import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { getSession } from "@/lib/auth";

export const roleGroups = {
  leadership: ["KETUA", "SEKRETARIS"] as Role[],
  finance: ["KETUA", "BENDAHARA"] as Role[],
  loanView: ["KETUA", "SEKRETARIS", "BENDAHARA"] as Role[],
  allStaff: ["KETUA", "SEKRETARIS", "BENDAHARA"] as Role[],
} as const;

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function authorized(roles?: Role[]) {
  const session = await getSession();
  if (!session) return { response: errorResponse("Sesi login tidak ditemukan.", 401) } as const;
  if (roles && !roles.includes(session.role)) return { response: errorResponse("Anda tidak memiliki akses ke fitur ini.", 403) } as const;
  return { session } as const;
}

export function safeText(value: unknown, maxLength = 10000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function positiveAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function dateOrNull(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
