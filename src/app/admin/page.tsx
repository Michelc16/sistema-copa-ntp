import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { verifyAdmin } from "@/lib/auth";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await verifyAdmin();
  if (!session) redirect("/admin/login");
  const data = await getTournamentView();
  return <AdminDashboard initialData={data} email={String(session.email ?? "Administrador")} />;
}
