import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { logAdminAction } from "@/lib/adminLog";
import { z } from "zod";

const schema = z.object({
  amount: z.number().int().min(-99999, "Minimal -99999").max(99999, "Maksimal 99999"),
  reason: z.string().min(1, "Alasan wajib diisi").max(200, "Alasan terlalu panjang"),
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

  const { amount, reason } = parsed.data;

  const user = await prisma.user.update({
    where: { id },
    data: { totalPoints: { increment: amount } },
  });

  await prisma.pointLog.create({
    data: { userId: id, amount, reason },
  });

  await logAdminAction({
    adminId: (session!.user as any).id,
    action: amount >= 0 ? "TAMBAH_POIN" : "KURANG_POIN",
    targetId: id,
    detail: `${amount > 0 ? "+" : ""}${amount} — ${reason}`,
  });

  return NextResponse.json({ data: user });
}
