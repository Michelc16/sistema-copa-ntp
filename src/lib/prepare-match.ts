import { getTournamentView } from "./data";
import { resolvePlayoffs } from "./playoffs";
import type { Match } from "./types";

// Freeze the actual participants when play starts, so later standings corrections
// cannot silently move an existing score to different teams.
export async function prepareMatch(id: string, input: Omit<Match, "id" | "tournamentId" | "sortOrder">) {
  const view = await getTournamentView(false);
  if (view.usingDemoData) throw new Error("Banco de dados indisponível; não foi possível validar o confronto.");
  const previous = view.matches.find((match) => match.id === id);
  const candidate: Match = { ...input, id, tournamentId: view.tournament.id, sortOrder: previous?.sortOrder ?? Math.max(0, ...view.matches.map((match) => match.sortOrder)) + 1 };
  if (!view.phases.some((phase) => phase.id === input.phase)) return { error: "Fase não encontrada." };
  for (const teamId of [input.homeTeamId, input.awayTeamId]) {
    if (teamId && !view.teams.some((team) => team.id === teamId)) return { error: "Equipe não pertence ao campeonato." };
  }
  const matches = previous ? view.matches.map((match) => match.id === id ? candidate : match) : [...view.matches, candidate];
  const resolved = resolvePlayoffs(view.teams, matches, view.adjustments, view.phases).find((match) => match.id === id)!;
  if (resolved.homeTeamId && resolved.homeTeamId === resolved.awayTeamId) return { error: "As equipes devem ser diferentes. Confira o ajuste manual do confronto." };
  const started = input.status === "live" || input.status === "finished" || input.sets.length > 0;
  if (started && (!resolved.homeTeamId || !resolved.awayTeamId)) return { error: "Defina as duas equipes ou conclua os jogos anteriores antes de registrar o placar." };
  return { data: started ? { ...input, homeTeamId: resolved.homeTeamId, awayTeamId: resolved.awayTeamId } : input };
}
