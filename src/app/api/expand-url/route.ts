import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL kosong" }, { status: 400 });

  try {
    // Fetch URL pendek dan ikuti redirect
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const expanded = res.url;
    return NextResponse.json({ expanded });
  } catch {
    return NextResponse.json({ error: "Gagal expand URL" }, { status: 500 });
  }
}
