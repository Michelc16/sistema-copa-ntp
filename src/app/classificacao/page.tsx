import { Info, Trophy } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StandingsTable } from "@/components/standings-table";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const data = await getTournamentView();
  const quarterfinals = [
    ["Quartas 1", "1º Grupo A", "4º Grupo B"],
    ["Quartas 2", "2º Grupo A", "3º Grupo B"],
    ["Quartas 3", "1º Grupo B", "4º Grupo A"],
    ["Quartas 4", "2º Grupo B", "3º Grupo A"],
  ];
  return <><SiteHeader /><main><PageHero eyebrow="Fase classificatória" title="Classificação por grupos" description="A posição na tabela define os cruzamentos das quartas de final." />
    <section className="section"><div className="container"><div className="standings-grid"><StandingsTable group="A" rows={data.standings.A} /><StandingsTable group="B" rows={data.standings.B} /></div>
      <div className="legend-card"><Info size={20} /><div><strong>Critérios de classificação</strong><p>Vitória por 2×0 vale 3 pontos. Vitória por 2×1 vale 2 pontos para o vencedor e 1 para o perdedor. Desempates seguem: vitórias, saldo de sets, saldo de pontos e confronto direto.</p></div></div>
      <div className="playoff-bracket"><div className="schedule-heading"><h2><Trophy size={24} /> Caminho até a final</h2><span>Fase eliminatória</span></div><div className="knockout-path">
        <section className="knockout-round"><h3>Quartas de final</h3>{quarterfinals.map(([label,home,away])=><article key={label}><small>{label}</small><strong>{home}</strong><i>×</i><strong>{away}</strong></article>)}</section>
        <section className="knockout-round"><h3>Semifinais</h3><article><small>Semifinal 1</small><strong>Vencedor Q1</strong><i>×</i><strong>Vencedor Q3</strong></article><article><small>Semifinal 2</small><strong>Vencedor Q2</strong><i>×</i><strong>Vencedor Q4</strong></article></section>
        <section className="knockout-round"><h3>Decisões</h3><article className="final-bracket"><small>Grande final</small><strong>Vencedor SF1</strong><i>×</i><strong>Vencedor SF2</strong></article><article><small>3º lugar</small><strong>Perdedor SF1</strong><i>×</i><strong>Perdedor SF2</strong></article></section>
      </div></div>
    </div></section>
  </main><SiteFooter /></>;
}
