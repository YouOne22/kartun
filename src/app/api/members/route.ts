import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorized, errorResponse, safeText } from "@/lib/api";
import { normalizePhoneNumber } from "@/lib/phone";

export const runtime = "nodejs";

const memberSelect = {
  id: true,
  memberId: true,
  fullName: true,
  email: true,
  gender: true,
  birthPlace: true,
  birthDate: true,
  phoneWa: true,
  dusun: true,
  rt: true,
  rw: true,
  address: true,
  education: true,
  occupation: true,
  joinDate: true,
  role: true,
  memberStatus: true,
  avatarUrl: true,
} as const;

const cardSelect = {
  memberId: true,
  fullName: true,
  email: true,
  phoneWa: true,
  role: true,
  memberStatus: true,
  qrCodeToken: true,
} as const;

function dateOrNull(value: unknown) {
  const text = safeText(value, 10);
  if (!text) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return undefined;
  const date = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() + 1 === Number(match[2]) && date.getUTCDate() === Number(match[3]) ? date : undefined;
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  const text = safeText(value, 20) as T;
  return allowed.includes(text) ? text : fallback;
}

const allowedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const avatarExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export async function GET(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS", "BENDAHARA", "ANGGOTA"]);
  if ("response" in auth) return auth.response;
  try {
    const purpose = new URL(request.url).searchParams.get("purpose");
    if (purpose === "card") {
      const members = await prisma.user.findMany({ where: { id: auth.session.userId }, select: cardSelect });
      return NextResponse.json({ members });
    }
    const members = auth.session.role === "ANGGOTA"
      ? await prisma.user.findMany({ where: { id: auth.session.userId }, select: memberSelect })
      : await prisma.user.findMany({ select: memberSelect, orderBy: { fullName: "asc" } });
    return NextResponse.json({ members });
  } catch (error: any) {
    console.error("GET Members Error:", error);
    return errorResponse("Data anggota belum tersedia.", 503);
  }
}

export async function PATCH(request: Request) {
  const auth = await authorized();
  if ("response" in auth) return auth.response;

  let formData: FormData | null = null;
  let jsonBody: Record<string, unknown> | null = null;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    try {
      formData = await request.formData();
    } catch (err) {
      console.error("PATCH FormData Parse Error:", err);
      return errorResponse("Format data tidak valid.");
    }
  } else {
    try {
      jsonBody = (await request.json()) as Record<string, unknown>;
    } catch (err) {
      console.error("PATCH JSON Parse Error:", err);
      return errorResponse("Format data tidak valid.");
    }
  }

  const value = (key: string): unknown => {
    if (formData) return formData.get(key);
    return jsonBody?.[key];
  };

  const id = safeText(value("id"), 50);
  if (!id) return errorResponse("ID anggota wajib diisi.");

  const isStaff = ["KETUA", "SEKRETARIS"].includes(auth.session.role);
  if (!isStaff && id !== auth.session.userId) {
    return errorResponse("Anda hanya dapat mengubah profil sendiri.", 403);
  }

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, avatarUrl: true, role: true, memberStatus: true } });
  if (!existing) return errorResponse("Anggota tidak ditemukan.", 404);

  const fullName = safeText(value("fullName"), 100);
  const email = safeText(value("email"), 100).toLowerCase();
  const phoneWa = normalizePhoneNumber(safeText(value("phoneWa"), 20));
  const gender = enumValue(value("gender"), ["L", "P"] as const, "L");
  const birthPlace = safeText(value("birthPlace"), 50) || null;
  const birthDate = dateOrNull(value("birthDate"));
  const dusun = safeText(value("dusun"), 50) || "Kemitir";
  const rt = safeText(value("rt"), 5);
  const rw = safeText(value("rw"), 5);
  const address = safeText(value("address"), 1000) || null;
  const education = safeText(value("education"), 30) || null;
  const occupation = safeText(value("occupation"), 50) || null;
  const joinDate = dateOrNull(value("joinDate"));
  const avatar = value("avatar");

  if (!fullName || !phoneWa) {
    return errorResponse("Nama dan WhatsApp wajib diisi.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse("Format email tidak valid.");
  }
  if (birthDate === undefined || joinDate === undefined) {
    return errorResponse("Format tanggal tidak valid.");
  }

  let role = existing.role;
  let memberStatus = existing.memberStatus;

  if (isStaff) {
    if (value("role")) {
      role = enumValue(value("role"), ["KETUA", "SEKRETARIS", "BENDAHARA", "ANGGOTA"] as const, existing.role);
    }
    if (value("memberStatus")) {
      memberStatus = enumValue(value("memberStatus"), ["AKTIF", "NON_AKTIF"] as const, existing.memberStatus);
    }
  }

  if (avatar instanceof File && avatar.size > 0) {
    if (!allowedAvatarTypes.has(avatar.type) || avatar.size > MAX_AVATAR_SIZE) {
      return errorResponse("Foto profil harus berupa JPG, PNG, WebP, atau GIF maksimal 5 MB.");
    }
  }

  let newAvatarUrl: string | null | undefined = undefined;

  try {
    if (avatar instanceof File && avatar.size > 0) {
      const extension = avatarExtensions[avatar.type] || "jpg";
      const filename = `members/${randomUUID()}.${extension}`;
      
      const blob = await put(filename, avatar, { access: "public" });
      newAvatarUrl = blob.url;

      if (existing.avatarUrl && existing.avatarUrl.includes("vercel-storage.com")) {
        await del(existing.avatarUrl).catch(() => undefined);
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        ...(email ? { email } : {}),
        phoneWa,
        gender,
        birthPlace,
        ...(birthDate !== undefined ? { birthDate } : {}),
        dusun,
        ...(rt ? { rt } : {}),
        ...(rw ? { rw } : {}),
        address,
        education,
        occupation,
        ...(joinDate !== undefined ? { joinDate } : {}),
        role,
        memberStatus,
        ...(newAvatarUrl !== undefined ? { avatarUrl: newAvatarUrl } : {}),
      },
      select: memberSelect,
    });

    return NextResponse.json({ member: updated });
  } catch (error: any) {
    console.error("PATCH Member Error:", error);
    const message = error?.message || "Profil anggota gagal diperbarui. Email mungkin sudah digunakan.";
    return errorResponse(message, 400);
  }
}

export async function DELETE(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS"]);
  if ("response" in auth) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = safeText(searchParams.get("id"), 50);

    if (!id) return errorResponse("ID anggota wajib diisi.");
    if (id === auth.session.userId) {
      return errorResponse("Anda tidak dapat menghapus akun Anda sendiri.", 403);
    }

    const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, avatarUrl: true } });
    if (!existing) return errorResponse("Anggota tidak ditemukan.", 404);

    await prisma.user.delete({ where: { id } });

    if (existing.avatarUrl && existing.avatarUrl.includes("vercel-storage.com")) {
      await del(existing.avatarUrl).catch(() => undefined);
    }

    return NextResponse.json({ success: true, message: "Anggota berhasil dihapus." });
  } catch (error: any) {
    console.error("DELETE Member Error:", error);
    return errorResponse("Anggota gagal dihapus.", 400);
  }
}

export async function POST(request: Request) {
  const auth = await authorized(["KETUA", "SEKRETARIS"]);
  if ("response" in auth) return auth.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("POST FormData Parse Error:", err);
    return errorResponse("Format data anggota tidak valid.");
  }

  const value = (key: string) => formData.get(key);
  const fullName = safeText(value("fullName"), 100);
  const email = safeText(value("email"), 100).toLowerCase();
  const phoneWa = normalizePhoneNumber(safeText(value("phoneWa"), 20));
  const gender = enumValue(value("gender"), ["L", "P"] as const, "L");
  const memberStatus = enumValue(value("memberStatus"), ["AKTIF", "NON_AKTIF"] as const, "AKTIF");
  const role = enumValue(value("role"), ["KETUA", "SEKRETARIS", "BENDAHARA", "ANGGOTA"] as const, "ANGGOTA");
  const birthDate = dateOrNull(value("birthDate"));
  const joinDate = dateOrNull(value("joinDate"));
  const avatar = value("avatar");

  if (!fullName || !email || !phoneWa || !safeText(value("rt"), 5) || !safeText(value("rw"), 5)) {
    return errorResponse("Nama, email, WhatsApp, RT, dan RW wajib diisi.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorResponse("Format email tidak valid.");
  if (birthDate === undefined || joinDate === undefined) return errorResponse("Format tanggal tidak valid.");
  
  if (avatar instanceof File && avatar.size > 0) {
    if (!allowedAvatarTypes.has(avatar.type) || avatar.size > MAX_AVATAR_SIZE) {
      return errorResponse("Foto profil harus berupa JPG, PNG, WebP, atau GIF maksimal 5 MB.");
    }
  }

  let avatarUrl: string | null = null;
  try {
    if (avatar instanceof File && avatar.size > 0) {
      const extension = avatarExtensions[avatar.type] || "jpg";
      const filename = `members/${randomUUID()}.${extension}`;
      
      const blob = await put(filename, avatar, { access: "public" });
      avatarUrl = blob.url;
    }

    const year = new Date().getFullYear();
    const count = await prisma.user.count({ where: { memberId: { startsWith: `KT-TH-${year}-` } } });
    const memberId = `KT-TH-${year}-${String(count + 1).padStart(3, "0")}`;
    const passwordHash = await hash(process.env.DEFAULT_PASSWORD || "Dusun2026", 12);
    const member = await prisma.user.create({
      data: {
        memberId,
        fullName,
        email,
        passwordHash,
        gender,
        birthPlace: safeText(value("birthPlace"), 50) || null,
        birthDate,
        phoneWa,
        dusun: safeText(value("dusun"), 50) || "Kemitir",
        rt: safeText(value("rt"), 5),
        rw: safeText(value("rw"), 5),
        address: safeText(value("address"), 1000) || null,
        education: safeText(value("education"), 30) || null,
        occupation: safeText(value("occupation"), 50) || null,
        joinDate: joinDate ?? undefined,
        memberStatus,
        role,
        avatarUrl,
        qrCodeToken: randomUUID(),
      },
      select: memberSelect,
    });
    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error("POST Member Error:", error);
    const message = error?.message || "Anggota gagal ditambahkan. Email mungkin sudah digunakan.";
    return errorResponse(message, 409);
  }
}