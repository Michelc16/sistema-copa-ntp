import assert from "node:assert/strict";
import test from "node:test";
import { resolvePlayoffs } from "../src/lib/playoffs";
import { matchMutationSchema } from "../src/lib/match-validation";
import { matchSeeds, phaseSeeds, teamSeeds } from "../src/lib/seed-data";
import { calculateStandings } from "../src/lib/standings";
import type { Match } from "../src/lib/types";

const win = [{ home: 25, away: 18 }, { home: 25, away: 20 }];
const fixtures = () => structuredClone(matchSeeds).map((match): Match => match.phase === "group" ? { ...match, status: "finished", sets: win } : match);
const resolve = (matches: Match[]) => resolvePlayoffs(teamSeeds, matches, [], phaseSeeds);
const byId = (matches: Match[], id: string) => matches.find((match) => match.id === id)!;

test("completed groups populate all quarterfinals from standings without mutating stored slots", () => {
  const matches = fixtures();
  const { A, B } = calculateStandings(teamSeeds, matches, []);
  const result = resolve(matches);
  const expected = [[A[0], B[3]], [A[1], B[2]], [B[0], A[3]], [B[1], A[2]]];
  expected.forEach(([home, away], i) => {
    assert.equal(byId(result, `qf${i+1}`).homeTeamId, home.team.id);
    assert.equal(byId(result, `qf${i+1}`).awayTeamId, away.team.id);
  });
  assert.equal(byId(matches, "qf1").homeTeamId, null);
  assert.deepEqual(resolve(matches), result);
});

test("missing, postponed or invalid group results do not qualify teams prematurely", () => {
  for (const matches of [fixtures().filter((m) => m.id !== "g1"), fixtures().map((m) => m.id === "g1" ? { ...m, status: "postponed" as const } : m), fixtures().map((m) => m.id === "g1" ? { ...m, sets: [] } : m)]) {
    assert.equal(byId(resolve(matches), "qf1").homeTeamId, null);
  }
});

test("winners and losers advance to the correct semifinal, final and bronze slots", () => {
  const matches = fixtures().map((m): Match => ["quarterfinal", "semifinal"].includes(m.phase) ? { ...m, status: "finished", sets: win } : m);
  const result = resolve(matches);
  assert.equal(byId(result, "sf1").homeTeamId, byId(result, "qf1").homeTeamId);
  assert.equal(byId(result, "sf1").awayTeamId, byId(result, "qf3").homeTeamId);
  assert.equal(byId(result, "sf2").homeTeamId, byId(result, "qf2").homeTeamId);
  assert.equal(byId(result, "sf2").awayTeamId, byId(result, "qf4").homeTeamId);
  assert.equal(byId(result, "final").homeTeamId, byId(result, "sf1").homeTeamId);
  assert.equal(byId(result, "final").awayTeamId, byId(result, "sf2").homeTeamId);
  assert.equal(byId(result, "third").homeTeamId, byId(result, "sf1").awayTeamId);
  assert.equal(byId(result, "third").awayTeamId, byId(result, "sf2").awayTeamId);
});

test("manual assignments survive and returning to null restores automatic assignment", () => {
  const matches = fixtures();
  const expected = byId(resolve(matches), "qf1").homeTeamId;
  byId(matches, "qf1").homeTeamId = "a4";
  assert.equal(byId(resolve(matches), "qf1").homeTeamId, "a4");
  byId(matches, "qf1").homeTeamId = null;
  assert.equal(byId(resolve(matches), "qf1").homeTeamId, expected);
});

test("rescheduling does not change crossings and live games do not advance", () => {
  const matches = fixtures();
  const expected = resolve(matches);
  byId(matches, "qf1").scheduledAt = "2027-01-01T10:00:00Z";
  byId(matches, "qf1").status = "live";
  byId(matches, "qf1").sets = win;
  const result = resolve(matches.reverse());
  assert.equal(byId(result, "qf1").homeTeamId, byId(expected, "qf1").homeTeamId);
  assert.equal(byId(result, "sf1").homeTeamId, null);
});

test("reopening a group result withdraws automatic qualification but preserves explicit teams", () => {
  const matches = fixtures();
  byId(matches, "qf2").homeTeamId = "a2";
  byId(matches, "g1").status = "scheduled";
  const result = resolve(matches);
  assert.equal(byId(result, "qf1").homeTeamId, null);
  assert.equal(byId(result, "qf2").homeTeamId, "a2");
});

test("finished scores require a winner and reject tied or excess sets", () => {
  const match = fixtures()[0];
  assert.equal(matchMutationSchema.safeParse(match).success, true);
  for (const sets of [[], [win[0]], [{ home: 25, away: 25 }, win[0]], [...win, win[0]]]) {
    assert.equal(matchMutationSchema.safeParse({ ...match, sets }).success, false);
  }
});

test("an incomplete knockout round never shifts the remaining crossings", () => {
  const result = resolve(fixtures().filter((match) => match.id !== "qf1"));
  assert.equal(byId(result, "qf2").homeTeamId, null);
  assert.equal(byId(result, "sf1").homeTeamId, null);
});
