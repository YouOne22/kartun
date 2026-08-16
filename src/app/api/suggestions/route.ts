import { NextRequest, NextResponse } from "next/server";
import { getSession, hasRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const MANAGEMENT_ROLES: Role[] = ["KETUA", "SEKRETARIS", "BENDAHARA"];

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { content, isAnonymous } = body as { content: string; isAnonymous?: boolean };

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Isi kritik dan saran tidak boleh kosong" }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: "Maksimal 2000 karakter" }, { status: 400 });
    }

    const userId = session?.userId ?? null;

    // If anonymous, don't associate with user even if logged in
    const suggestion = await prisma.suggestion.create({
      data: {
        content: content.trim(),
        userId: isAnonymous ? null : userId,
        isAnonymous: isAnonymous ?? false,
      },
    });

    return NextResponse.json({ suggestion }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim kritik dan saran" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only management can view suggestions
    if (!hasRole(session.role, MANAGEMENT_ROLES)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              memberId: true,
              role: true,
            },
          },
        },
      }),
      prisma.suggestion.count(),
    ]);

    return NextResponse.json({
      suggestions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data kritik dan saran" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasRole(session.role, MANAGEMENT_ROLES)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID kritik dan saran diperlukan" }, { status: 400 });
    }

    await prisma.suggestion.delete({ where: { id } });

    return NextResponse.json({ message: "Kritik dan saran berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus kritik dan saran" }, { status: 500 });
  }
}