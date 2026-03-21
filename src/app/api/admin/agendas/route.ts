import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function guard(session: any) {
  return session && ["ADMIN", "SUPERADMIN"].includes(session.user.role);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!guard(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  if (!body.title || !body.date) return NextResponse.json({ error: "Judul dan tanggal wajib diisi" }, { status: 400 });

  const agenda = await prisma.agenda.create({
    data: {
      title:       body.title,
      description: body.description || null,
      date:        new Date(body.date),
      endDate:     body.endDate ? new Date(body.endDate) : null,
      location:    body.location || null,
      locationType:body.locationType ?? "OFFLINE",
      mapsEmbed:   body.mapsEmbed || null,
      mapsUrl:     body.mapsUrl || null,
      isPublished: false,
    },
  });

  return NextResponse.json({ data: agenda }, { status: 201 });
}
