import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const COOLDOWN_DAYS = 30;

// PATCH — pilih avatar preset
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { avatarId } = await req.json();

  if (avatarId) {
    const avatar = await prisma.avatar.findFirst({ where: { filename: avatarId } });
    if (!avatar) return NextResponse.json({ error: "Avatar tidak valid" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarId },
  });

  return NextResponse.json({ message: "Avatar diperbarui" });
}

// POST — upload avatar custom ke Cloudinary
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cek cooldown 30 hari
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  // Parse form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format file harus JPG atau PNG" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
  }

  // Convert file ke buffer lalu upload ke Cloudinary
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const publicId = `tcb-avatars/${session.user.id}_${Date.now()}`;

  const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
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
        )
        .end(buffer);
    }
  );

  // Simpan URL Cloudinary ke DB sebagai avatarId
  const cloudinaryUrl = uploadResult.secure_url;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      avatarId: cloudinaryUrl,
      avatarLastUploadAt: new Date(),
    },
  });

  return NextResponse.json({ url: cloudinaryUrl, message: "Avatar berhasil diupload" });
}
