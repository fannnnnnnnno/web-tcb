import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rateLimit";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024;
const COOLDOWN_DAYS = 30;

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: maks 10 request per menit per user
  if (!rateLimit(`patch-avatar:${(session.user as any).id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak request. Coba lagi nanti." }, { status: 429 });
  }

  const { avatarId } = await req.json();

  if (avatarId) {
    const avatar = await prisma.avatar.findFirst({ where: { filename: avatarId } });
    if (!avatar) return NextResponse.json({ error: "Avatar tidak valid" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { avatarId },
  });

  return NextResponse.json({ message: "Avatar diperbarui" });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: maks 5 upload per jam per user
  if (!rateLimit(`post-avatar:${(session.user as any).id}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak upload. Coba lagi nanti." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { avatarLastUploadAt: true },
  });

  if (user?.avatarLastUploadAt) {
    const next = new Date(user.avatarLastUploadAt);
    next.setDate(next.getDate() + COOLDOWN_DAYS);
    if (new Date() < next) {
      const sisaHari = Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return NextResponse.json({ error: "Cooldown", sisaHari }, { status: 429 });
    }
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format file harus JPG atau PNG" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const publicId = `tcb-avatars/${(session.user as any).id}_${Date.now()}`;

  const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: "tcb-avatars",
          overwrite: true,
          transformation: [
            { width: 300, height: 300, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result as { secure_url: string; public_id: string });
        }
      ).end(buffer);
    }
  );

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: {
      avatarId: uploadResult.secure_url,
      avatarLastUploadAt: new Date(),
    },
  });

  return NextResponse.json({ url: uploadResult.secure_url, message: "Avatar berhasil diupload" });
}
