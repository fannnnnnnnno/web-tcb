import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <>
      {/* Hide the public navbar inside admin */}
      <style>{`header.fixed { display: none !important; }`}</style>
      <div className="flex min-h-screen bg-tcb-black">
        <AdminSidebar role={session.user.role} name={session.user.name} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 pt-16 md:pt-6 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
