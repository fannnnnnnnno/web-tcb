import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AvatarUploader, AvatarDeleteButton } from "@/components/admin/AvatarUploader";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Avatar" };

export default async function AdminAvatarsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "SUPERADMIN") redirect("/admin");

  const avatars = await prisma.avatar.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-tcb-white">Avatar</h1>
          <p className="text-xs text-tcb-gray-400 mt-0.5">Hanya Superadmin yang dapat mengelola avatar</p>
        </div>
        <AvatarUploader />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {avatars.length === 0 && (
          <div className="col-span-6 card text-center py-12 text-tcb-gray-400 text-sm">
            Belum ada avatar. Upload avatar pertama!
          </div>
        )}
        {avatars.map((av) => (
          <div key={av.id} className="group">
            <div className="aspect-square rounded-xl overflow-hidden border-2 border-tcb-gray-700 group-hover:border-tcb-red transition-all">
              <img src={av.url} alt={av.filename} className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-tcb-gray-500 mt-1 truncate text-center">{av.filename}</p>
            <div className="mt-1 flex justify-center">
              <AvatarDeleteButton avatarId={av.id} filename={av.filename} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
