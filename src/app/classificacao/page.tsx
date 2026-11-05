import { MatchCard } from "@/components/match-card";
import { Info, Trophy } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StandingsTable } from "@/components/standings-table";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const data = await getTournamentView();
  const rounds = data.phases.filter((phase) => phase.active && phase.kind === "knockout");
  const groupMatches = data.matches.filter((match) => data.phases.some((phase) => phase.id === match.phase && phase.kind === "group"));
  const finished = groupMatches.filter((match) => match.status === "finished").length;
  return <><SiteHeader /><main><PageHero eyebrow="Fase classificatória" title="Classificação por grupos" description="A posição na tabela define os cruzamentos das quartas de final." />
    <section className="section"><div className="container"><div className="standings-grid"><StandingsTable group="A" rows={data.standings.A} /><StandingsTable group="B" rows={data.standings.B} /></div>
      <div className="legend-card"><Info size={20} /><div><strong>Critérios de classificação</strong><p>Vitória por 2×0 vale 3 pontos. Vitória por 2×1 vale 2 pontos para o vencedor e 1 para o perdedor. Desempates seguem: vitórias, saldo de sets, saldo de pontos e confronto direto.</p></div></div>
      <div className="playoff-bracket"><div className="schedule-heading"><h2><Trophy size={24} /> Caminho até a final</h2><span>Fase eliminatória</span></div>
        <p className="bracket-explanation">{finished} de {groupMatches.length} jogos de grupos encerrados. Os classificados e vencedores preenchem automaticamente as próximas vagas. Ajustes da organização aparecem aqui.</p>
        <div className="live-bracket">{rounds.map((phase) => {
          const matches = data.matches.filter((match) => match.phase === phase.id).sort((a,b) => a.sortOrder-b.sortOrder);
          return <section className="live-bracket-round" key={phase.id}><h3>{phase.name}</h3>{matches.length ? matches.map((match) => <MatchCard key={match.id} match={match} teams={data.teams} phaseKind={phase.kind} />) : <p className="bracket-explanation">A organização ainda não cadastrou os jogos desta fase.</p>}</section>;
        })}</div>
      </div>
    </div></section>
  </main><SiteFooter /></>;
}
