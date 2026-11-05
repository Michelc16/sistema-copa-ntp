import { Trophy } from "lucide-react";
import { MatchCard } from "./match-card";
import type { TournamentPhase, TournamentView } from "@/lib/types";

export function TournamentBracket({ data }: { data: TournamentView }) {
  const rounds = data.phases
    .filter((phase) => phase.active && phase.kind === "knockout")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const progression = rounds.filter((phase) => phase.id !== "third_place" && phase.id !== "final");
  // Keep the decisions in one grid cell: the final must never wrap below the quarters.
  const decisions = ["third_place", "final"]
    .flatMap((id) => rounds.filter((phase) => phase.id === id));

  function renderRound(phase: TournamentPhase) {
    const matches = data.matches.filter((match) => match.phase === phase.id).sort((a, b) => a.sortOrder - b.sortOrder);
    return <section className={`live-bracket-round${phase.id === "final" ? " live-bracket-final" : ""}`} key={phase.id} aria-labelledby={`bracket-${phase.id}`}>
      <h3 id={`bracket-${phase.id}`}>{phase.id === "final" && <Trophy size={17} aria-hidden="true" />}{phase.name}</h3>
      {matches.length ? matches.map((match) => <MatchCard key={match.id} match={match} teams={data.teams} phaseKind={phase.kind} />) : <p className="bracket-explanation">A organização ainda não cadastrou os jogos desta fase.</p>}
    </section>;
  }

  return <div className="live-bracket">
    {progression.map(renderRound)}
    {decisions.length > 0 && <div className="live-bracket-decisions" role="group" aria-label="Decisões: terceiro lugar e final">{decisions.map(renderRound)}</div>}
  </div>;
}
