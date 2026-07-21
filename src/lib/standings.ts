import type { Match, Standing, StandingAdjustment, Team } from "./types";

function winnerFromSets(match: Match) {
  const validSets = match.sets.filter(
    (set) => Number.isFinite(set.home) && Number.isFinite(set.away) && set.home !== set.away,
  );
  const homeSets = validSets.filter((set) => set.home > set.away).length;
  const awaySets = validSets.filter((set) => set.away > set.home).length;
  if (homeSets < 2 && awaySets < 2) return null;
  return { homeSets, awaySets, validSets, homeWon: homeSets > awaySets };
}

export function calculateStandings(
  teams: Team[],
  matches: Match[],
  adjustments: StandingAdjustment[],
): { A: Standing[]; B: Standing[] } {
  const adjustmentMap = new Map(adjustments.map((item) => [item.teamId, item]));
  const rows = new Map<string, Standing>();

  for (const team of teams.filter((item) => item.active)) {
    const adjustment = adjustmentMap.get(team.id);
    rows.set(team.id, {
      position: 0,
      team,
      played: 0,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      points: adjustment?.points ?? 0,
      adjustment: adjustment?.points ?? 0,
      adjustmentReason: adjustment?.reason ?? "",
    });
  }

  for (const match of matches) {
    if (match.phase !== "group" || match.status !== "finished" || !match.homeTeamId || !match.awayTeamId) continue;
    const result = winnerFromSets(match);
    const home = rows.get(match.homeTeamId);
    const away = rows.get(match.awayTeamId);
    if (!result || !home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.setsWon += result.homeSets;
    home.setsLost += result.awaySets;
    away.setsWon += result.awaySets;
    away.setsLost += result.homeSets;

    for (const set of result.validSets) {
      home.pointsFor += set.home;
      home.pointsAgainst += set.away;
      away.pointsFor += set.away;
      away.pointsAgainst += set.home;
    }

    const winner = result.homeWon ? home : away;
    const loser = result.homeWon ? away : home;
    winner.wins += 1;
    loser.losses += 1;
    if (Math.min(result.homeSets, result.awaySets) === 0) {
      winner.points += 3;
    } else {
      winner.points += 2;
      loser.points += 1;
    }
  }

  const sortGroup = (group: "A" | "B") =>
    [...rows.values()]
      .filter((row) => row.team.groupName === group)
      .sort((a, b) => {
        const byPoints = b.points - a.points;
        if (byPoints) return byPoints;
        const byWins = b.wins - a.wins;
        if (byWins) return byWins;
        const bySets = b.setsWon - b.setsLost - (a.setsWon - a.setsLost);
        if (bySets) return bySets;
        const byRallies = b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst);
        if (byRallies) return byRallies;
        return a.team.sortOrder - b.team.sortOrder;
      })
      .map((row, index) => ({ ...row, position: index + 1 }));

  return { A: sortGroup("A"), B: sortGroup("B") };
}
