import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { AdminSidebar, AdminMobileHeader } from "@/components/admin/sidebar";

export default async function AdminDashboardLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper-sunken)] lg:flex-row">
      <AdminMobileHeader adminName={session.name} />
      <AdminSidebar adminName={session.name} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
    </div>
  );
}
