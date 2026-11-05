import { calculateStandings } from "./standings";
import type { Match, StandingAdjustment, Team, TournamentPhase } from "./types";

// A null participant is an automatic slot. Explicit participants are admin overrides.
// Ordering uses sortOrder, never dates: rescheduling must not change the bracket.
export function matchResult(match: Match) {
  if (match.status !== "finished" || !match.homeTeamId || !match.awayTeamId) return null;
  let home = 0;
  let away = 0;
  for (const set of match.sets) {
    if (home === 2 || away === 2 || set.home === set.away) return null;
    if (set.home > set.away) home++; else away++;
  }
  if (home !== 2 && away !== 2) return null;
  return {
    winner: home === 2 ? match.homeTeamId : match.awayTeamId,
    loser: home === 2 ? match.awayTeamId : match.homeTeamId,
  };
}

export function hasCompletedGroups(teams: Team[], matches: Match[], phases: TournamentPhase[]): boolean {
  const groupIds = new Set(phases.filter((phase) => phase.kind === "group").map((phase) => phase.id));
  const groups = matches.filter((match) => groupIds.has(match.phase));
  // Require every round-robin pairing, not just the games currently present.
  return (["A", "B"] as const).every((group) => {
    const members = teams.filter((team) => team.active && team.groupName === group);
    return members.length === 4 && members.every((team, index) => members.slice(index + 1).every((other) =>
      groups.some((match) => matchResult(match) && [match.homeTeamId, match.awayTeamId].includes(team.id) && [match.homeTeamId, match.awayTeamId].includes(other.id)),
    ));
  }) && groups.length > 0 && groups.every((match) => matchResult(match));
}

export function resolvePlayoffs(teams: Team[], matches: Match[], adjustments: StandingAdjustment[], phases: TournamentPhase[]): Match[] {
  const resolved = matches.map((match) => ({ ...match }));
  const groupIds = new Set(phases.filter((phase) => phase.kind === "group").map((phase) => phase.id));
  const standings = calculateStandings(teams, matches, adjustments, groupIds);
  const complete = hasCompletedGroups(teams, matches, phases);
  const round = (phase: string) => resolved.filter((match) => match.phase === phase).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const fill = (match: Match | undefined, home: string | null, away: string | null) => {
    if (!match) return;
    match.homeTeamId ??= home;
    match.awayTeamId ??= away;
  };
  const quarterMatches = round("quarterfinal");
  const quarters = quarterMatches.length === 4 ? quarterMatches : [];
  if (complete) {
    const { A, B } = standings;
    const pairings = [[A[0], B[3]], [A[1], B[2]], [B[0], A[3]], [B[1], A[2]]];
    pairings.forEach(([home, away], index) => fill(quarters[index], home.team.id, away.team.id));
  }
  const result = (match: Match | undefined, outcome: "winner" | "loser") => match ? matchResult(match)?.[outcome] ?? null : null;
  const semiMatches = round("semifinal");
  const semis = semiMatches.length === 2 ? semiMatches : [];
  fill(semis[0], result(quarters[0], "winner"), result(quarters[2], "winner"));
  fill(semis[1], result(quarters[1], "winner"), result(quarters[3], "winner"));
  fill(round("final")[0], result(semis[0], "winner"), result(semis[1], "winner"));
  fill(round("third_place")[0], result(semis[0], "loser"), result(semis[1], "loser"));
  return resolved;
}
