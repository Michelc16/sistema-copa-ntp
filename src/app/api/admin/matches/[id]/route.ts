import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";

const scheduledAtSchema = z.string().trim().refine((value) => {
  const hasTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  return hasTimezone && !Number.isNaN(Date.parse(value));
}, { message: "Data e horário do jogo inválidos." }).transform((value) => new Date(value).toISOString());

const schema = z.object({
  homeTeamId: z.string().nullable(), awayTeamId: z.string().nullable(),
  scheduledAt: scheduledAtSchema, status: z.enum(["scheduled","live","finished","postponed","cancelled"]),
  court: z.string().trim().min(1).max(100), notes: z.string().trim().max(300),
  sets: z.array(z.object({ home: z.number().int().min(0).max(99), away: z.number().int().min(0).max(99) })).max(3),
}).refine((data) => !data.homeTeamId || !data.awayTeamId || data.homeTeamId !== data.awayTeamId, { message: "As equipes devem ser diferentes." });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados do jogo inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const { id } = await context.params;
    const d = parsed.data;
    const sql = db();
    const result = await sql`UPDATE matches SET home_team_id=${d.homeTeamId},away_team_id=${d.awayTeamId},scheduled_at=${d.scheduledAt},status=${d.status},court=${d.court},notes=${d.notes},sets=${sql.json(d.sets)} WHERE id=${id} RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
