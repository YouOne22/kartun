import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Gender, Role } from "@prisma/client";

/**
 * One-shot endpoint to seed the dev account into the production (Neon) database.
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

    const user = await prisma.user.upsert({
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

    return NextResponse.json({
      message: "Dev account seeded successfully.",
      user,
      login: { email: "dev@tunasharapan.id", password: defaultPassword },
    });
  } catch (error) {
    console.error("Seed-dev error:", error);
    return NextResponse.json(
      { error: "Failed to seed dev account.", details: String(error) },
      { status: 500 },
    );
  }
}
