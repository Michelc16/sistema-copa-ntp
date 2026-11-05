import { hasCompletedGroups, matchResult } from "./playoffs";
import type { Match, TournamentView } from "./types";

export function getHomeStage(data: TournamentView) {
  const phases = data.phases.filter((phase) => phase.active).sort((a, b) => a.sortOrder - b.sortOrder);
  const visibleMatches = data.matches.filter((match) => phases.some((phase) => phase.id === match.phase));
  const upcoming = visibleMatches.filter((match) => ["scheduled", "live", "postponed"].includes(match.status))
    .sort((a, b) => Number(b.status === "live") - Number(a.status === "live") || Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
  const knockout = hasCompletedGroups(data.teams, data.matches, data.phases);
  const rounds = phases.filter((phase) => phase.kind === "knockout").map((phase) => ({
    phase,
    matches: visibleMatches.filter((match) => match.phase === phase.id).sort((a, b) => a.sortOrder - b.sortOrder),
  }));
  const pending = (match: Match) => match.status !== "cancelled" && !matchResult(match);
  const current = rounds.find((round) => round.matches.some(pending));
  // Final and bronze belong to the same match day; neither should hide the other.
  const deciding = current && ["final", "third_place"].includes(current.phase.id);
  const final = visibleMatches.find((match) => match.phase === "final" && matchResult(match));
  const finished = knockout && !current && !!final;
  const matches = finished || deciding
    ? rounds.filter((round) => ["final", "third_place"].includes(round.phase.id)).flatMap((round) => round.matches).sort((a,b) => Number(b.phase === "final") - Number(a.phase === "final"))
    : current?.matches ?? [];
  const featured = matches.find((match) => match.status === "live")
    ?? [...matches].filter((match) => match.status === "scheduled").sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))[0]
    ?? matches.find((match) => match.status === "postponed") ?? matches[0];
  const championId = finished && final ? matchResult(final)?.winner : undefined;
  return {
    knockout, finished, rounds, matches, featured, upcoming, visibleMatches,
    phaseId: finished || deciding ? "final" : current?.phase.id,
    label: finished ? "Campeonato encerrado" : deciding ? "As decisões" : current?.phase.name ?? "Mata-mata",
    champion: data.teams.find((team) => team.id === championId),
  };
}

export type HomeStage = ReturnType<typeof getHomeStage>;
