import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { formatDate, formatTime, phaseLabels, statusLabels } from "@/lib/format";
import type { Match, Team } from "@/lib/types";

function score(match: Match, side: "home" | "away") {
  return match.sets.filter((set) => side === "home" ? set.home > set.away : set.away > set.home).length;
}

function MiniTeam({ team, placeholder }: { team?: Team; placeholder: string }) {
  return (
    <div className="mini-team">
      <span className="team-orb" style={{ "--team-color": team?.color ?? "#64748b" } as React.CSSProperties}>{team?.code ?? "?"}</span>
      <strong>{team?.name ?? placeholder}</strong>
    </div>
  );
}

export function MatchCard({ match, teams }: { match: Match; teams: Team[] }) {
  const home = teams.find((team) => team.id === match.homeTeamId);
  const away = teams.find((team) => team.id === match.awayTeamId);
  const showScore = match.status === "finished" || match.status === "live";
  return (
    <article className={`match-card ${match.status === "live" ? "is-live" : ""}`}>
      <div className="match-topline">
        <span>{match.roundLabel || phaseLabels[match.phase]}{match.groupName ? ` • Grupo ${match.groupName}` : ""}</span>
        <span className={`status-pill status-${match.status}`}>{statusLabels[match.status]}</span>
      </div>
      <div className="match-versus">
        <MiniTeam team={home} placeholder={match.notes || "A definir"} />
        <div className="score-box">{showScore ? <><b>{score(match, "home")}</b><i>×</i><b>{score(match, "away")}</b></> : <span>×</span>}</div>
        <MiniTeam team={away} placeholder="A definir" />
      </div>
      {showScore && match.sets.length > 0 && (
        <div className="set-line">{match.sets.map((set, index) => <span key={index}>Set {index + 1}: <b>{set.home}–{set.away}</b></span>)}</div>
      )}
      <div className="match-meta">
        <span><CalendarDays size={15} /> {formatDate(match.scheduledAt, { year: undefined })}</span>
        <span><Clock3 size={15} /> {formatTime(match.scheduledAt)}</span>
        <span><MapPin size={15} /> {match.court}</span>
      </div>
    </article>
  );
}
