import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { verifyAdmin } from "@/lib/auth";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await verifyAdmin();
  if (!session) redirect("/admin/login");
  const data = await getTournamentView();
  const versionKey = JSON.stringify({
    teams: data.teams.map((team) => [team.id, team.name, team.groupName, team.players.length]),
    matches: data.matches.map((match) => [match.id, match.status, match.sets]),
    adjustments: data.adjustments,
    tournament: [data.tournament.name, data.tournament.announcement, data.tournament.rules],
  });
  return <AdminDashboard key={versionKey} initialData={data} email={String(session.email ?? "Administrador")} />;
}
