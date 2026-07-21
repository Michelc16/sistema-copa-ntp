import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { verifyAdmin } from "@/lib/auth";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await verifyAdmin();
  if (!session) redirect("/admin/login");
  const data = await getTournamentView();
  // Remount the client editor after a refresh whenever any persisted value
  // changes, including captain flags, shirt numbers, dates and team choices.
  const versionKey = JSON.stringify(data);
  return <AdminDashboard key={versionKey} initialData={data} email={String(session.email ?? "Administrador")} />;
}
