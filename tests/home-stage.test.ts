import assert from "node:assert/strict";
import test from "node:test";
import { getHomeStage } from "../src/lib/home-stage";
import { resolvePlayoffs } from "../src/lib/playoffs";
import { calculateStandings } from "../src/lib/standings";
import { matchSeeds, phaseSeeds, teamSeeds, tournamentSeed } from "../src/lib/seed-data";
import type { TournamentView } from "../src/lib/types";

function fixture(completedPhases: string[]): TournamentView {
  const raw = structuredClone(matchSeeds).map((match) => completedPhases.includes(match.phase) ? { ...match, status: "finished" as const, sets: [{home:25,away:20},{home:25,away:19}] } : match);
  const matches = resolvePlayoffs(teamSeeds, raw, [], phaseSeeds);
  return { tournament: tournamentSeed, teams: teamSeeds, phases: structuredClone(phaseSeeds), matches, adjustments: [], standings: calculateStandings(teamSeeds, matches, []), usingDemoData: true };
}

test("home keeps groups until every group game is valid and finished", () => {
  const view = fixture([]);
  assert.equal(getHomeStage(view).knockout, false);
  const complete = fixture(["group"]);
  complete.matches.find((match) => match.id === "g1")!.sets = [];
  assert.equal(getHomeStage(complete).knockout, false);
});

test("home automatically promotes quarterfinals, semifinals and the two decisions", () => {
  const quarters = getHomeStage(fixture(["group"]));
  assert.equal(quarters.knockout, true);
  assert.equal(quarters.phaseId, "quarterfinal");
  assert.equal(quarters.matches.length, 4);
  assert.ok(quarters.matches.every((match) => match.homeTeamId && match.awayTeamId));
  const semis = getHomeStage(fixture(["group", "quarterfinal"]));
  assert.equal(semis.phaseId, "semifinal");
  assert.equal(semis.matches.length, 2);
  const decisions = getHomeStage(fixture(["group", "quarterfinal", "semifinal"]));
  assert.equal(decisions.phaseId, "final");
  assert.deepEqual(decisions.matches.map((match) => match.phase), ["final", "third_place"]);
});

test("a live game is featured before a scheduled game", () => {
  const view = fixture(["group"]);
  view.matches.find((match) => match.id === "qf4")!.status = "live";
  assert.equal(getHomeStage(view).featured?.id, "qf4");
});

test("hidden phases cannot appear as featured games or in the home schedule", () => {
  const view = fixture(["group"]);
  view.phases.find((phase) => phase.id === "quarterfinal")!.active = false;
  const stage = getHomeStage(view);
  assert.ok(!stage.visibleMatches.some((match) => match.phase === "quarterfinal"));
  assert.ok(!stage.upcoming.some((match) => match.phase === "quarterfinal"));
  assert.equal(stage.phaseId, "semifinal");
});

test("the home celebrates the champion only after all decisions are complete", () => {
  assert.equal(getHomeStage(fixture(["group", "quarterfinal", "semifinal", "final"])).finished, false);
  const stage = getHomeStage(fixture(["group", "quarterfinal", "semifinal", "final", "third_place"]));
  assert.equal(stage.finished, true);
  assert.ok(stage.champion);
  assert.equal(stage.matches.length, 2);
});

test("missing knockout games give a useful empty state instead of group tables", () => {
  const view = fixture(["group"]);
  view.matches = view.matches.filter((match) => match.phase === "group");
  const stage = getHomeStage(view);
  assert.equal(stage.knockout, true);
  assert.equal(stage.finished, false);
  assert.equal(stage.featured, undefined);
  assert.equal(stage.matches.length, 0);
});

test("a postponed round stays current and cancelled games are not featured ahead of it", () => {
  const view = fixture(["group"]);
  for (const match of view.matches.filter((match) => match.phase === "quarterfinal")) match.status = "postponed";
  const stage = getHomeStage(view);
  assert.equal(stage.phaseId, "quarterfinal");
  assert.equal(stage.featured?.status, "postponed");
});
