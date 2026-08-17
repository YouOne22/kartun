import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
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
      section: true,
      role: true,
      memberStatus: true,
      isDefaultPassword: true,
      avatarUrl: true,
      qrCodeToken: true,
    },
  });
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({ user });
}
