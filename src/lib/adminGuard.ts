import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export type AdminRole = "ADMIN" | "SUPERADMIN";

export async function requireAdmin(allowedRoles: AdminRole[] = ["ADMIN", "SUPERADMIN"]) {
  const session = await auth();

  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  const role = (session.user as any).role as string;

  if (!allowedRoles.includes(role as AdminRole)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }

  return { error: null, session };
}
