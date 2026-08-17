import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Gender, Role } from "@prisma/client";

/**
 * One-shot endpoint to seed accounts into the production (Neon) database.
 *
 * Usage: GET https://<domain>/api/seed-dev?secret=<AUTH_SECRET>
 *
 * Safe to leave in code — requires the real AUTH_SECRET as query param.
 * Remove after first successful run if desired.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!secret || secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const defaultPassword = process.env.DEFAULT_PASSWORD || "kartunmaju";
    const passwordHash = await hash(defaultPassword, 12);

    const devUser = await prisma.user.upsert({
      where: { email: "dev@tunasharapan.id" },
      update: {
        fullName: "Dev Monitor",
        passwordHash,
        role: Role.KETUA,
        isDefaultPassword: false,
      },
      create: {
        memberId: "KT-TH-2026-000",
        fullName: "Dev Monitor",
        email: "dev@tunasharapan.id",
        passwordHash,
        isDefaultPassword: false,
        role: Role.KETUA,
        gender: Gender.L,
        phoneWa: "080000000000",
        rt: "00",
        rw: "00",
        dusun: "Kemitir",
        address: "Akun developer lokal (bug-monitoring)",
        qrCodeToken: randomUUID(),
      },
      select: {
        id: true,
        memberId: true,
        email: true,
        fullName: true,
        role: true,
        isDefaultPassword: true,
      },
    });

    const ketuaUser = await prisma.user.upsert({
      where: { email: "ketua@tunasharapan.id" },
      update: {
        passwordHash,
        isDefaultPassword: true,
      },
      create: {
        memberId: "KT-TH-2026-001",
        fullName: "Ketua Karang Taruna",
        email: "ketua@tunasharapan.id",
        passwordHash,
        isDefaultPassword: true,
        gender: Gender.L,
        phoneWa: "081234567890",
        rt: "01",
        rw: "01",
        address: "Dusun Kemitir",
        role: Role.KETUA,
        qrCodeToken: randomUUID(),
      },
      select: {
        id: true,
        memberId: true,
        email: true,
        fullName: true,
        role: true,
        isDefaultPassword: true,
      },
    });

    return NextResponse.json({
      message: "Accounts seeded successfully.",
      devUser,
      ketuaUser,
      credentials: {
        dev: { email: "dev@tunasharapan.id", password: defaultPassword },
        ketua: { email: "ketua@tunasharapan.id", password: defaultPassword },
      },
    });
  } catch (error) {
    console.error("Seed-dev error:", error);
    return NextResponse.json(
      { error: "Failed to seed accounts.", details: String(error) },
      { status: 500 },
    );
  }
}
