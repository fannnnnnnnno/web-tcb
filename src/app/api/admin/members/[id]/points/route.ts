import { NextResponse } from "next/server";

// Poin global tidak bisa diinput manual.
// Gunakan /api/admin/members/[id]/game-points untuk input poin per game.
// Poin global dihitung otomatis dari akumulasi semua poin game.

export async function POST() {
  return NextResponse.json(
    { error: "Input poin global dinonaktifkan. Gunakan input poin per game." },
    { status: 400 }
  );
}
