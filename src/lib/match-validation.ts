import { z } from "zod";

export const scheduledAtSchema = z.string().trim().refine((value) => {
  const hasTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  return hasTimezone && !Number.isNaN(Date.parse(value));
}, { message: "Data e horário do jogo inválidos." }).transform((value) => new Date(value).toISOString());

export const matchMutationSchema = z.object({
  phase: z.string().trim().min(1).max(100),
  roundLabel: z.string().trim().min(1).max(100),
  groupName: z.enum(["A", "B"]).nullable(),
  homeTeamId: z.string().nullable(),
  awayTeamId: z.string().nullable(),
  scheduledAt: scheduledAtSchema,
  status: z.enum(["scheduled", "live", "finished", "postponed", "cancelled"]),
  court: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(300),
  sets: z.array(z.object({ home: z.number().int().min(0).max(99), away: z.number().int().min(0).max(99) })).max(3),
}).refine(
  (data) => !data.homeTeamId || !data.awayTeamId || data.homeTeamId !== data.awayTeamId,
  { message: "As equipes devem ser diferentes." },
);
