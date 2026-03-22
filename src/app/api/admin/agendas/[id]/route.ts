import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function guard(s: any) {
  return s && ["ADMIN", "SUPERADMIN"].includes(s.user.role);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!guard(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const data: any = {};

  if (body.title !== undefined)        data.title        = body.title;
  if (body.description !== undefined)  data.description  = body.description || null;
  if (body.date !== undefined)         data.date         = body.date ? new Date(body.date) : undefined;
  if (body.endDate !== undefined)      data.endDate      = body.endDate ? new Date(body.endDate) : null;
  if (body.location !== undefined)     data.location     = body.location || null;
  if (body.locationType !== undefined) data.locationType = body.locationType;
  if (body.mapsEmbed !== undefined)    data.mapsEmbed    = body.mapsEmbed || null;
  if (body.mapsUrl !== undefined)      data.mapsUrl      = body.mapsUrl || null;
  if (body.isPublished !== undefined)  data.isPublished  = body.isPublished;
  if (body.lat !== undefined)          data.lat          = body.lat;
  if (body.lng !== undefined)          data.lng          = body.lng;

  const agenda = await prisma.agenda.update({ where: { id }, data });
  return NextResponse.json({ data: agenda });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!guard(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  await prisma.agenda.delete({ where: { id } });
  return NextResponse.json({ message: "Agenda dihapus" });
}
