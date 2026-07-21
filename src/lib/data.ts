import { db, hasDatabase } from "./db";
import { matchSeeds, teamSeeds, tournamentSeed } from "./seed-data";
import { calculateStandings } from "./standings";
import type { Match, Player, StandingAdjustment, Team, Tournament, TournamentRules, TournamentView } from "./types";

type DbTournament = {
  id: string; slug: string; name: string; edition: string; subtitle: string; description: string;
  venue: string; city: string; start_date: Date | string; end_date: Date | string; announcement: string; rules: TournamentRules;
};
type DbTeam = { id: string; tournament_id: string; code: string; name: string; group_name: "A" | "B"; color: string; captain: string; sort_order: number; active: boolean };
type DbPlayer = { id: string; team_id: string; name: string; shirt_number: number | null; is_captain: boolean; active: boolean; sort_order: number };
type DbMatch = { id: string; tournament_id: string; phase: Match["phase"]; group_name: "A" | "B" | null; round_label: string; home_team_id: string | null; away_team_id: string | null; scheduled_at: Date | string; court: string; status: Match["status"]; sets: Match["sets"] | string; notes: string; sort_order: number };
type DbAdjustment = { team_id: string; points: number; reason: string };

function demoView(): TournamentView {
  const adjustments: StandingAdjustment[] = [];
  const teams = structuredClone(teamSeeds);
  const matches = structuredClone(matchSeeds);
  return {
    tournament: structuredClone(tournamentSeed),
    teams,
    matches,
    standings: calculateStandings(teams, matches, adjustments),
    adjustments,
    usingDemoData: true,
  };
}

function normalizeDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : String(value);
}

export function normalizeDateOnly(value: Date | string) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  const raw = String(value).trim();
  const isoDate = raw.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) return isoDate;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

export async function getTournamentView(): Promise<TournamentView> {
  if (!hasDatabase()) return demoView();
  try {
    const sql = db();
    const [tournamentRows, teamRows, playerRows, matchRows, adjustmentRows] = await Promise.all([
      sql<DbTournament[]>`
        SELECT id, slug, name, edition, subtitle, description, venue, city,
          start_date::text AS start_date, end_date::text AS end_date,
          announcement, rules
        FROM tournaments
        WHERE id = ${tournamentSeed.id}
        LIMIT 1
      `,
      sql<DbTeam[]>`SELECT * FROM teams WHERE tournament_id = ${tournamentSeed.id} ORDER BY sort_order, code`,
      sql<DbPlayer[]>`SELECT p.* FROM players p JOIN teams t ON t.id = p.team_id WHERE t.tournament_id = ${tournamentSeed.id} ORDER BY p.sort_order, p.name`,
      sql<DbMatch[]>`SELECT * FROM matches WHERE tournament_id = ${tournamentSeed.id} ORDER BY scheduled_at, sort_order`,
      sql<DbAdjustment[]>`SELECT a.* FROM standing_adjustments a JOIN teams t ON t.id = a.team_id WHERE t.tournament_id = ${tournamentSeed.id}`,
    ]);

    if (!tournamentRows[0]) return demoView();
    const tournamentRow = tournamentRows[0];
    const tournament: Tournament = {
      id: tournamentRow.id,
      slug: tournamentRow.slug,
      name: tournamentRow.name,
      edition: tournamentRow.edition,
      subtitle: tournamentRow.subtitle,
      description: tournamentRow.description,
      venue: tournamentRow.venue,
      city: tournamentRow.city,
      startDate: normalizeDateOnly(tournamentRow.start_date),
      endDate: normalizeDateOnly(tournamentRow.end_date),
      announcement: tournamentRow.announcement,
      rules: tournamentRow.rules,
    };
    const players: Player[] = playerRows.map((row) => ({
      id: row.id, teamId: row.team_id, name: row.name, shirtNumber: row.shirt_number,
      isCaptain: row.is_captain, active: row.active, sortOrder: row.sort_order,
    }));
    const teams: Team[] = teamRows.map((row) => ({
      id: row.id, tournamentId: row.tournament_id, code: row.code, name: row.name,
      groupName: row.group_name, color: row.color, captain: row.captain,
      sortOrder: row.sort_order, active: row.active,
      players: players.filter((player) => player.teamId === row.id),
    }));
    const matches: Match[] = matchRows.map((row) => ({
      id: row.id, tournamentId: row.tournament_id, phase: row.phase, groupName: row.group_name,
      roundLabel: row.round_label, homeTeamId: row.home_team_id, awayTeamId: row.away_team_id,
      scheduledAt: normalizeDate(row.scheduled_at), court: row.court, status: row.status,
      sets: typeof row.sets === "string" ? JSON.parse(row.sets) : row.sets,
      notes: row.notes, sortOrder: row.sort_order,
    }));
    const adjustments: StandingAdjustment[] = adjustmentRows.map((row) => ({ teamId: row.team_id, points: row.points, reason: row.reason }));
    return { tournament, teams, matches, standings: calculateStandings(teams, matches, adjustments), adjustments, usingDemoData: false };
  } catch (error) {
    console.error("Falha ao carregar o Neon; usando dados demonstrativos.", error);
    return demoView();
  }
}
