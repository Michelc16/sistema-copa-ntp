import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { formatDate, formatTime, phaseLabels, statusLabels } from "@/lib/format";
import type { Match, Team } from "@/lib/types";

function score(match: Match, side: "home" | "away") {
  return match.sets.filter((set) => side === "home" ? set.home > set.away : set.away > set.home).length;
}

type MatchSlotLabels = { home: string; away: string };

const defaultSlotLabels: Record<Exclude<Match["phase"], "group">, MatchSlotLabels> = {
  semifinal: { home: "1º do Grupo A", away: "2º do Grupo B" },
  third_place: { home: "Perdedor da Semifinal 1", away: "Perdedor da Semifinal 2" },
  final: { home: "Vencedor da Semifinal 1", away: "Vencedor da Semifinal 2" },
};

function normalizeGroupSlot(label: string) {
  return label.replace(/^(\d)\s*[º°o]?\s*(?:do\s+)?grupo\s+/i, "$1º do Grupo ");
}

export function getMatchSlotLabels(match: Match): MatchSlotLabels {
  if (match.phase === "group") return { home: "A definir", away: "A definir" };

  // Existing tournament data stores both semifinal origins in `notes`.
  // Splitting it here keeps already-created databases compatible.
  const noteSlots = match.notes
    .split(/\s+[x×]\s+/i)
    .map((label) => normalizeGroupSlot(label.trim()))
    .filter(Boolean);

  if (noteSlots.length === 2) return { home: noteSlots[0], away: noteSlots[1] };

  if (match.phase === "semifinal" && /(?:semifinal|sf)\s*2/i.test(`${match.roundLabel} ${match.id}`)) {
    return { home: "1º do Grupo B", away: "2º do Grupo A" };
  }

  return defaultSlotLabels[match.phase];
}

function MiniTeam({ team, slotLabel }: { team?: Team; slotLabel?: string }) {
  return (
    <div className={`mini-team ${team ? "" : "is-pending"}`}>
      <span className="team-orb" aria-hidden="true" style={{ "--team-color": team?.color ?? "#64748b" } as React.CSSProperties}>{team?.code ?? "?"}</span>
      <div className="mini-team-copy">
        <strong>{team?.name ?? "A definir"}</strong>
        {slotLabel && <small>{slotLabel}</small>}
      </div>
    </div>
  );
}

export function MatchCard({ match, teams }: { match: Match; teams: Team[] }) {
  const home = teams.find((team) => team.id === match.homeTeamId);
  const away = teams.find((team) => team.id === match.awayTeamId);
  const slotLabels = getMatchSlotLabels(match);
  const showScore = match.status === "finished" || match.status === "live";
  return (
    <article className={`match-card ${match.status === "live" ? "is-live" : ""}`}>
      <div className="match-topline">
        <span>{match.roundLabel || phaseLabels[match.phase]}{match.groupName ? ` • Grupo ${match.groupName}` : ""}</span>
        <span className={`status-pill status-${match.status}`}>{statusLabels[match.status]}</span>
      </div>
      <div className="match-versus">
        <MiniTeam team={home} slotLabel={match.phase === "group" ? undefined : slotLabels.home} />
        <div className="score-box">{showScore ? <><b>{score(match, "home")}</b><i>×</i><b>{score(match, "away")}</b></> : <span>×</span>}</div>
        <MiniTeam team={away} slotLabel={match.phase === "group" ? undefined : slotLabels.away} />
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
