import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import DashboardNav from "@/src/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <DashboardNav user={user} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}