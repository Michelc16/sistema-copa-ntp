import Link from "next/link";
import { ArrowDown, ArrowRight, CalendarDays, Check, ChevronRight, Clock3, MapPin, Trophy, UsersRound } from "lucide-react";
import { MatchCard, getMatchSlotLabels } from "./match-card";
import { formatDate, formatTime, statusLabels } from "@/lib/format";
import type { HomeStage } from "@/lib/home-stage";
import type { TournamentView } from "@/lib/types";

const copy: Record<string, { headline: string; accent: string; description: string }> = {
  quarterfinal: { headline: "Agora é tudo", accent: "ou nada.", description: "Os grupos ficaram para trás. Agora, cada confronto vale a permanência na Copa. Escolha seu lado e venha fazer a quadra vibrar." },
  semifinal: { headline: "A final está", accent: "logo ali.", description: "Um confronto separa cada equipe da grande decisão. É hora de jogar junto, vibrar em cada ponto e fazer a diferença na torcida." },
  final: { headline: "É hora de", accent: "fazer história.", description: "O título está em jogo. Venha viver as decisões da Copa NTP de perto e aplaudir quem fez desta edição uma grande competição." },
};

type Props = { data: TournamentView; stage: HomeStage };

export function KnockoutHero({ data, stage }: Props) {
  const words = stage.finished
    ? { headline: "Uma campanha.", accent: "Um título.", description: "Cada ponto trouxe a gente até aqui. Celebre a equipe campeã e reveja os resultados de uma Copa feita por quem ama o vôlei." }
    : copy[stage.phaseId ?? ""] ?? { headline: "A Copa entrou", accent: "em outra fase.", description: "A fase de grupos acabou. Acompanhe os próximos confrontos e prepare sua torcida para o mata-mata." };
  const match = stage.featured;
  const slots = match ? getMatchSlotLabels(match) : undefined;
  const teams = match ? [data.teams.find((team) => team.id === match.homeTeamId), data.teams.find((team) => team.id === match.awayTeamId)] : [];
  const showScore = match?.status === "live" || match?.status === "finished";
  return <section className={`arena-hero ${stage.finished ? "arena-celebration" : ""}`}>
    <div className="arena-watermark" aria-hidden="true">NTP</div>
    <div className="container arena-grid">
      <div className="arena-copy">
        <div className="arena-kicker"><span className="arena-edition">{data.tournament.edition} • {data.tournament.name}</span><span className="arena-phase">{stage.label}</span></div>
        <h1>{words.headline}<br /><em>{words.accent}</em></h1>
        <p>{words.description}</p>
        <div className="hero-actions"><Link href="#confrontos" className="button button-primary">{stage.finished ? "Rever as decisões" : "Ver os confrontos"}<ArrowDown size={18} /></Link><Link href="/classificacao" className="button button-ghost">Caminho até o título <ArrowRight size={17} /></Link></div>
        <div className="arena-location"><MapPin size={19} /><span><strong>{data.tournament.venue}</strong><small>{data.tournament.city}</small></span></div>
      </div>
      <div className="arena-spotlight">
        {stage.champion ? <div className="arena-champion"><div className="arena-trophy"><Trophy size={62} strokeWidth={1.3} /></div><span className="eyebrow">O topo é de vocês</span><h2>{stage.champion.name}</h2><span className="arena-champion-label">Campeã da {data.tournament.name}</span><Link href="#confrontos" className="text-link">Veja os resultados <ArrowDown size={17} /></Link></div> : match ? <>
          <div className="spotlight-top"><span><span className={`spotlight-dot ${match.status === "live" ? "spotlight-dot-live" : ""}`} />{match.status === "live" ? "A emoção está acontecendo" : match.status === "postponed" ? "Aguarde a nova programação" : "O próximo encontro é na quadra"}</span><small>{statusLabels[match.status]}</small></div>
          <div className="spotlight-round"><Trophy size={16} />{match.roundLabel}</div>
          <div className="spotlight-versus">{teams.map((team, index) => <div className="spotlight-team" key={index}>
            <span className="spotlight-emblem" style={{ "--team-color": team?.color ?? "#91a0b8" } as React.CSSProperties}>{team?.code ?? "?"}</span>
            <strong>{team?.name ?? "A definir"}</strong><small>{index === 0 ? slots?.home : slots?.away}</small>
          </div>)}<div className="spotlight-vs">{showScore ? `${match.sets.filter((set) => set.home > set.away).length} : ${match.sets.filter((set) => set.away > set.home).length}` : "VS"}</div></div>
          <div className="spotlight-date">{match.status === "postponed" ? <strong>Nova data a confirmar</strong> : <><CalendarDays size={19} /><strong>{formatDate(match.scheduledAt, { weekday: "short", year: undefined })}</strong><span /><Clock3 size={17} /><strong>{formatTime(match.scheduledAt)}</strong></>}</div>
          <div className="spotlight-footer"><span>{match.court}</span><span>Traga sua torcida <UsersRound size={15} /></span></div>
        </> : <div className="arena-champion"><Trophy size={62} /><h2>Uma nova disputa vem aí.</h2><p>A organização está preparando os confrontos. Acompanhe a programação por aqui.</p></div>}
      </div>
    </div>
    <div className="container arena-roadmap"><span className="arena-roadmap-label">A jornada<br /><strong>até a taça</strong></span><ol>
      <li className="is-complete"><Check size={15} /><span>Fase de grupos</span><small>Concluída</small></li>
      {stage.rounds.filter((round) => round.phase.id !== "third_place").map((round) => {
        const done = round.matches.length > 0 && round.matches.every((match) => match.status === "finished" || match.status === "cancelled");
        const current = !stage.finished && round.phase.id === stage.phaseId;
        return <li key={round.phase.id} className={current ? "is-current" : done ? "is-complete" : ""} aria-current={current ? "step" : undefined}>{done ? <Check size={15} /> : <ChevronRight size={15} />}<span>{round.phase.name}</span><small>{current ? "Estamos aqui" : done ? "Concluída" : "A seguir"}</small></li>;
      })}
    </ol></div>
  </section>;
}

export function KnockoutSchedule({ data, stage }: Props) {
  const nextDate = stage.matches.filter((match) => match.status === "scheduled").sort((a,b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))[0];
  return <section className="section arena-schedule" id="confrontos" aria-labelledby="confrontos-title"><div className="container">
    <div className="section-heading"><div><span className="eyebrow">{stage.finished ? "O capítulo final" : "Valendo cada ponto"}</span><h2 id="confrontos-title">{stage.finished ? "Os resultados das decisões" : stage.label}</h2><p>{stage.finished ? "Os placares que encerraram esta edição." : "Seu time em quadra. Sua voz na arquibancada."}</p></div><Link href="/classificacao" className="text-link">Chaveamento completo <ArrowRight size={17} /></Link></div>
    {stage.matches.length > 0 ? <div className="arena-match-grid">{stage.matches.map((match, index) => {
      const next = stage.phaseId === "quarterfinal" ? `Vencedor → Semifinal ${index === 0 || index === 2 ? "1" : "2"}` : stage.phaseId === "semifinal" ? "Vencedor → Grande final • Perdedor → 3º lugar" : match.phase === "final" ? "A disputa pela taça" : "A disputa pelo pódio";
      return <div className="arena-match" key={match.id}><div className="arena-match-label"><span>{String(index+1).padStart(2,"0")}</span><small>{next}</small></div><MatchCard match={match} teams={data.teams} phaseKind="knockout" /></div>;
    })}</div> : <div className="arena-empty"><Trophy size={28} /><h3>Prepare a torcida.</h3><p>Os jogos da próxima fase serão exibidos assim que a organização confirmar a programação.</p><Link href="/jogos" className="text-link">Consultar agenda <ArrowRight size={16} /></Link></div>}
    {!stage.finished && <div className="arena-invitation"><div className="arena-invitation-icon"><UsersRound size={30} /></div><div><span className="eyebrow">O jogo fica maior com você</span><h3>Tem lugar para a sua torcida.</h3><p>{nextDate ? `Próximo encontro: ${formatDate(nextDate.scheduledAt, { year: undefined })}, às ${formatTime(nextDate.scheduledAt)}. ` : "Acompanhe a confirmação das datas na agenda. "}{data.tournament.venue} • {data.tournament.city}.</p></div><a className="button button-ghost" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.tournament.venue}, ${data.tournament.city}`)}`} target="_blank" rel="noopener noreferrer">Ver localização <MapPin size={17} /></a></div>}
    <div className="arena-history"><span><Check size={17} /> Fase de grupos concluída</span><Link href="/classificacao" className="text-link">Rever a classificação dos grupos <ArrowRight size={16} /></Link></div>
  </div></section>;
}
