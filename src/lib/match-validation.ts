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
}).superRefine((data, ctx) => {
  if (data.status !== "finished") return;
  let home = 0;
  let away = 0;
  for (const set of data.sets) {
    if (home === 2 || away === 2 || set.home === set.away) {
      ctx.addIssue({ code: "custom", message: "Placar inválido: não pode haver set empatado nem set após a segunda vitória." });
      return;
    }
    if (set.home > set.away) home++; else away++;
  }
  if (home !== 2 && away !== 2) ctx.addIssue({ code: "custom", message: "Para encerrar o jogo, uma equipe precisa vencer dois sets." });
}).refine(
  (data) => !data.homeTeamId || !data.awayTeamId || data.homeTeamId !== data.awayTeamId,
  { message: "As equipes devem ser diferentes." },
);
