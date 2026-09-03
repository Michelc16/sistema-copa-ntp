import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./db";
import { matchSeeds, phaseSeeds, teamSeeds, tournamentSeed } from "./seed-data";

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

    for (const phase of phaseSeeds) {
      await tx`
        INSERT INTO tournament_phases (id, tournament_id, name, kind, sort_order, active)
        VALUES (${phase.id}, ${phase.tournamentId}, ${phase.name}, ${phase.kind}, ${phase.sortOrder}, ${phase.active})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    await tx`ALTER TABLE matches VALIDATE CONSTRAINT matches_phase_fkey`;

    for (const match of matchSeeds) {
      await tx`
        INSERT INTO matches (id, tournament_id, phase, group_name, round_label, home_team_id, away_team_id, scheduled_at, court, status, sets, notes, sort_order)
        VALUES (${match.id}, ${match.tournamentId}, ${match.phase}, ${match.groupName}, ${match.roundLabel}, ${match.homeTeamId}, ${match.awayTeamId}, ${match.scheduledAt}, ${match.court}, ${match.status}, ${tx.json(match.sets)}, ${match.notes}, ${match.sortOrder})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    const migration = await tx<{ id: string }[]>`
      INSERT INTO app_migrations (id)
      VALUES ('2026-09-cartaz-quarterfinals')
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;

    if (migration.length) {
      for (const match of matchSeeds.filter((item) => item.sortOrder >= 9)) {
        await tx`
          UPDATE matches SET
            phase=${match.phase}, group_name=${match.groupName}, round_label=${match.roundLabel},
            home_team_id=${match.homeTeamId}, away_team_id=${match.awayTeamId},
            scheduled_at=${match.scheduledAt}, notes=${match.notes}, sort_order=${match.sortOrder}
          WHERE id=${match.id}
        `;
      }
      await tx`
        UPDATE tournaments
        SET rules=jsonb_set(
          jsonb_set(rules, '{format}', ${tx.json(tournamentSeed.rules.format)}, true),
          '{competition}', ${tx.json(tournamentSeed.rules.competition)}, true
        ), updated_at=NOW()
        WHERE id=${tournamentSeed.id}
      `;
    }
  });

  return { phases: phaseSeeds.length, teams: teamSeeds.length, players: teamSeeds.reduce((total, team) => total + team.players.length, 0), matches: matchSeeds.length };
}
