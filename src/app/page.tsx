import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, ShieldCheck, Trophy, UsersRound, Volleyball } from "lucide-react";
import { MatchCard } from "@/components/match-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StandingsTable } from "@/components/standings-table";
import { formatDate } from "@/lib/format";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getTournamentView();
  const nextMatches = data.matches.filter((match) => match.status === "scheduled" || match.status === "live" || match.status === "postponed").slice(0, 2);
  const completed = data.matches.filter((match) => match.status === "finished").length;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="hero-kicker"><Volleyball size={17} /> Jogos de agosto a dezembro de 2026</span>
              <h1><em>4ª</em> Copa <span>NTP</span></h1>
              <p>{data.tournament.description}</p>
              <div className="hero-actions">
                <Link href="/jogos" className="button button-primary">Ver tabela de jogos <ArrowRight size={18} /></Link>
                <Link href="/classificacao" className="button button-ghost">Acompanhar classificação</Link>
              </div>
              <div className="hero-details">
                <span><CalendarDays size={18} /><small>Início</small><strong>{formatDate(data.tournament.startDate)}</strong></span>
                <span><MapPin size={18} /><small>Local</small><strong>{data.tournament.city}</strong></span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="crest-card">
                <div className="crest-ring"><Volleyball size={82} strokeWidth={1.4} /></div>
                <small>Não Tem Passe</small><strong>COPA NTP</strong><span>4ª edição • 2026</span>
              </div>
              <div className="fair-play-card"><ShieldCheck size={27} /><span><b>Fair play</b>Respeito e inclusão</span></div>
            </div>
          </div>
        </section>

        {data.tournament.announcement && <div className="announcement"><div className="container"><span>COMUNICADO</span><p>{data.tournament.announcement}</p><Link href="/jogos">Ver agenda <ArrowRight size={15} /></Link></div></div>}

        <section className="stats-strip">
          <div className="container stats-grid">
            <div><UsersRound /><strong>8</strong><span>equipes</span></div>
            <div><Volleyball /><strong>56</strong><span>atletas</span></div>
            <div><CalendarDays /><strong>{data.matches.length}</strong><span>partidas</span></div>
            <div><Trophy /><strong>{completed}</strong><span>resultados</span></div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">Agenda oficial</span><h2>Próximos jogos</h2><p>Horários e confrontos atualizados pela organização.</p></div><Link href="/jogos" className="text-link">Ver todos <ArrowRight size={17} /></Link></div>
            <div className="match-grid">{nextMatches.map((match) => <MatchCard key={match.id} match={match} teams={data.teams} />)}</div>
          </div>
        </section>

        <section className="section section-muted">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">Disputa acirrada</span><h2>Classificação</h2><p>A pontuação é atualizada depois de cada súmula confirmada.</p></div><Link href="/classificacao" className="text-link">Classificação completa <ArrowRight size={17} /></Link></div>
            <div className="standings-grid"><StandingsTable group="A" rows={data.standings.A} compact /><StandingsTable group="B" rows={data.standings.B} compact /></div>
          </div>
        </section>

        <section className="section values-section">
          <div className="container values-grid">
            <div><span className="eyebrow">Muito além do placar</span><h2>Uma copa feita para todo mundo.</h2><p>Competição, diversidade e amizade dividindo a mesma quadra.</p><Link href="/regras" className="button button-primary">Conhecer o regulamento</Link></div>
            <div className="value-list">
              {[["Respeito", "Dentro e fora da quadra"], ["Inclusão", "Todos fazem parte do jogo"], ["Espírito esportivo", "Competir com lealdade"]].map(([title, description]) => <article key={title}><CheckCircle2 /><div><strong>{title}</strong><span>{description}</span></div></article>)}
            </div>
          </div>
        </section>

        <section className="section media-section">
          <div className="container media-grid">
            <div className="media-copy"><span className="eyebrow">Informação oficial</span><h2>Leve a Copa NTP com você</h2><p>Consulte jogos, regras, equipes e resultados em qualquer celular. O site é público e não exige cadastro.</p><div className="bullet-list"><span><CheckCircle2 /> Classificação automática</span><span><CheckCircle2 /> Elencos completos</span><span><CheckCircle2 /> Resultados por set</span></div></div>
            <div className="poster-frame"><Image src="/cartaz-agosto.jpeg" alt="Cartaz Jogos de Agosto da 4ª Copa NTP" width={1536} height={1024} /></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
