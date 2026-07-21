import { Info, Trophy } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StandingsTable } from "@/components/standings-table";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const data = await getTournamentView();
  return <><SiteHeader /><main><PageHero eyebrow="Fase classificatória" title="Classificação por grupos" description="Os dois melhores de cada grupo garantem vaga nas semifinais." />
    <section className="section"><div className="container"><div className="standings-grid"><StandingsTable group="A" rows={data.standings.A} /><StandingsTable group="B" rows={data.standings.B} /></div>
      <div className="legend-card"><Info size={20} /><div><strong>Critérios de classificação</strong><p>Vitória por 2×0 vale 3 pontos. Vitória por 2×1 vale 2 pontos para o vencedor e 1 para o perdedor. Desempates seguem: vitórias, saldo de sets, saldo de pontos e confronto direto.</p></div></div>
      <div className="playoff-bracket"><div className="schedule-heading"><h2><Trophy size={24} /> Caminho até a final</h2><span>Fase eliminatória</span></div><div className="bracket-grid"><article><small>SEMIFINAL 1</small><strong>1º Grupo A</strong><i>×</i><strong>2º Grupo B</strong></article><article><small>SEMIFINAL 2</small><strong>1º Grupo B</strong><i>×</i><strong>2º Grupo A</strong></article><article className="final-bracket"><small>GRANDE FINAL</small><strong>Vencedor SF1</strong><i>×</i><strong>Vencedor SF2</strong></article></div></div>
    </div></section>
  </main><SiteFooter /></>;
}
