import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logAdminAction } from "@/lib/adminLog";
import { z } from "zod";

const schema = z.object({
  badgeId: z.string().min(1, "Pilih lencana"),
  note: z.string().max(200).optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { badgeId, note } = parsed.data;

  try {
    const ub = await prisma.userBadge.create({
      data: { userId: id, badgeId, note },
      include: { badge: { select: { name: true } } },
    });

    await logAdminAction({
      adminId: (session!.user as any).id,
      action: "BERI_LENCANA",
      targetId: id,
      detail: ub.badge.name,
    });

    return NextResponse.json({ data: ub }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Member sudah punya lencana ini" }, { status: 409 });
  }
}
