import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./db";
import { matchSeeds, teamSeeds, tournamentSeed } from "./seed-data";

export async function setupDatabase() {
  const sql = db();
  const schema = await readFile(path.join(process.cwd(), "database", "schema.sql"), "utf8");
  await sql.unsafe(schema);

  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO tournaments (id, slug, name, edition, subtitle, description, venue, city, start_date, end_date, announcement, rules)
      VALUES (${tournamentSeed.id}, ${tournamentSeed.slug}, ${tournamentSeed.name}, ${tournamentSeed.edition}, ${tournamentSeed.subtitle}, ${tournamentSeed.description}, ${tournamentSeed.venue}, ${tournamentSeed.city}, ${tournamentSeed.startDate}, ${tournamentSeed.endDate}, ${tournamentSeed.announcement}, ${tx.json(tournamentSeed.rules)})
      ON CONFLICT (id) DO NOTHING
    `;

    for (const team of teamSeeds) {
      await tx`
        INSERT INTO teams (id, tournament_id, code, name, group_name, color, captain, sort_order, active)
        VALUES (${team.id}, ${team.tournamentId}, ${team.code}, ${team.name}, ${team.groupName}, ${team.color}, ${team.captain}, ${team.sortOrder}, ${team.active})
        ON CONFLICT (id) DO NOTHING
      `;
      for (const player of team.players) {
        await tx`
          INSERT INTO players (id, team_id, name, shirt_number, is_captain, active, sort_order)
          VALUES (${player.id}, ${player.teamId}, ${player.name}, ${player.shirtNumber}, ${player.isCaptain}, ${player.active}, ${player.sortOrder})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    for (const match of matchSeeds) {
      await tx`
        INSERT INTO matches (id, tournament_id, phase, group_name, round_label, home_team_id, away_team_id, scheduled_at, court, status, sets, notes, sort_order)
        VALUES (${match.id}, ${match.tournamentId}, ${match.phase}, ${match.groupName}, ${match.roundLabel}, ${match.homeTeamId}, ${match.awayTeamId}, ${match.scheduledAt}, ${match.court}, ${match.status}, ${tx.json(match.sets)}, ${match.notes}, ${match.sortOrder})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  });

  return { teams: teamSeeds.length, players: teamSeeds.reduce((total, team) => total + team.players.length, 0), matches: matchSeeds.length };
}
