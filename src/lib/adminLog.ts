import { prisma } from "@/lib/prisma";

export type AdminAction =
  | "TAMBAH_POIN"
  | "KURANG_POIN"
  | "BERI_LENCANA"
  | "HAPUS_MEMBER"
  | "RESET_AVATAR_COOLDOWN"
  | "TAMBAH_MEMBER"
  | "BUAT_AGENDA"
  | "HAPUS_AGENDA"
  | "UPDATE_AGENDA";

export async function logAdminAction({
  adminId,
  action,
  targetId,
  detail,
}: {
  adminId: string;
  action: AdminAction;
  targetId?: string;
  detail?: string;
}) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetId: targetId ?? null,
        detail: detail ?? null,
      },
    });
  } catch {
    // Jangan crash app hanya karena log gagal
    console.error("[AdminLog] Gagal mencatat aksi admin:", action);
  }
}
