import type { MatchPhase, MatchStatus } from "./types";

export const phaseLabels: Record<MatchPhase, string> = {
  group: "Fase de grupos",
  semifinal: "Semifinal",
  third_place: "3º lugar",
  final: "Final",
};

export const statusLabels: Record<MatchStatus, string> = {
  scheduled: "Agendado",
  live: "Ao vivo",
  finished: "Encerrado",
  postponed: "Adiado",
  cancelled: "Cancelado",
};

function displayDate(value: string) {
  // A date without a time represents a calendar day, not midnight UTC.
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00-03:00`)
    : new Date(value);
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(displayDate(value));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
