import { MatchCard } from "@/components/match-card";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTournamentView } from "@/lib/data";
import { phaseLabels } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const data = await getTournamentView();
  const phases = ["group", "semifinal", "third_place", "final"] as const;
  return <><SiteHeader /><main><PageHero eyebrow="Calendário 2026" title="Jogos e resultados" description="Acompanhe todos os confrontos, horários, resultados e placares set a set." />
    <section className="section"><div className="container schedule-sections">
      {phases.map((phase) => {
        const matches = data.matches.filter((match) => match.phase === phase);
        if (!matches.length) return null;
        return <div className="schedule-block" key={phase}><div className="schedule-heading"><h2>{phaseLabels[phase]}</h2><span>{matches.length} {matches.length === 1 ? "partida" : "partidas"}</span></div><div className="match-grid">{matches.map((match) => <MatchCard key={match.id} match={match} teams={data.teams} />)}</div></div>;
      })}
    </div></section>
  </main><SiteFooter /></>;
}
