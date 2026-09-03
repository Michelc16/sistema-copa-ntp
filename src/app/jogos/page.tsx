import { MatchCard } from "@/components/match-card";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const data = await getTournamentView();
  const phases = data.phases.filter((phase) => phase.active).sort((a, b) => a.sortOrder - b.sortOrder);
  return <><SiteHeader /><main><PageHero eyebrow="Calendário 2026" title="Jogos e resultados" description="Acompanhe todos os confrontos, horários, resultados e placares set a set." />
    <section className="section"><div className="container schedule-sections">
      {phases.map((phase) => {
        const matches = data.matches.filter((match) => match.phase === phase.id);
        if (!matches.length) return null;
        return <div className="schedule-block" key={phase.id}><div className="schedule-heading"><h2>{phase.name}</h2><span>{matches.length} {matches.length === 1 ? "partida" : "partidas"}</span></div><div className="match-grid">{matches.map((match) => <MatchCard key={match.id} match={match} teams={data.teams} phaseKind={phase.kind} />)}</div></div>;
      })}
    </div></section>
  </main><SiteFooter /></>;
}
