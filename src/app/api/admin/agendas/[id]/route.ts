import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function guard(session: any) {
  return session && ["ADMIN", "SUPERADMIN"].includes(session.user.role);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!guard(session))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  try {
    const updated = await prisma.agenda.update({
      where: { id },
      data: {
        ...(body.isPublished  !== undefined && { isPublished: body.isPublished }),
        ...(body.title        !== undefined && { title: body.title }),
        ...(body.description  !== undefined && { description: body.description }),
        ...(body.date         !== undefined && { date: new Date(body.date) }),
        ...(body.endDate      !== undefined && { endDate: new Date(body.endDate) }),
        ...(body.location     !== undefined && { location: body.location }),
        ...(body.locationType !== undefined && { locationType: body.locationType }),
        ...(body.mapsEmbed    !== undefined && { mapsEmbed: body.mapsEmbed }),
        ...(body.mapsUrl      !== undefined && { mapsUrl: body.mapsUrl }),
      },
    });
    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (e.code === "P2025")
      return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!guard(session))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;

  try {
    await prisma.agenda.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2025")
      return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
