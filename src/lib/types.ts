export type MatchStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";
export type MatchPhase = "group" | "semifinal" | "third_place" | "final";

export type SetScore = { home: number; away: number };

export type TournamentRules = {
  format: string[];
  competition: string[];
  infractions: string[];
  schedule: string[];
  conduct: string[];
  scoring: string[];
};

export type Tournament = {
  id: string;
  slug: string;
  name: string;
  edition: string;
  subtitle: string;
  description: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  announcement: string;
  rules: TournamentRules;
};

export type Player = {
  id: string;
  teamId: string;
  name: string;
  shirtNumber: number | null;
  isCaptain: boolean;
  active: boolean;
  sortOrder: number;
};

export type Team = {
  id: string;
  tournamentId: string;
  code: string;
  name: string;
  groupName: "A" | "B";
  color: string;
  captain: string;
  sortOrder: number;
  active: boolean;
  players: Player[];
};

export type Match = {
  id: string;
  tournamentId: string;
  phase: MatchPhase;
  groupName: "A" | "B" | null;
  roundLabel: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  scheduledAt: string;
  court: string;
  status: MatchStatus;
  sets: SetScore[];
  notes: string;
  sortOrder: number;
};

export type StandingAdjustment = {
  teamId: string;
  points: number;
  reason: string;
};

export type Standing = {
  position: number;
  team: Team;
  played: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  points: number;
  adjustment: number;
  adjustmentReason: string;
};

export type TournamentView = {
  tournament: Tournament;
  teams: Team[];
  matches: Match[];
  standings: { A: Standing[]; B: Standing[] };
  adjustments: StandingAdjustment[];
  usingDemoData: boolean;
};
