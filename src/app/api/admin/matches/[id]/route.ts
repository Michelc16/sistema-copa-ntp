import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";
import { matchMutationSchema } from "@/lib/match-validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = matchMutationSchema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados do jogo inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const { id } = await context.params;
    const d = parsed.data;
    const sql = db();
    const result = await sql`UPDATE matches SET phase=${d.phase},group_name=${d.groupName},round_label=${d.roundLabel},home_team_id=${d.homeTeamId},away_team_id=${d.awayTeamId},scheduled_at=${d.scheduledAt},status=${d.status},court=${d.court},notes=${d.notes},sets=${sql.json(d.sets)} WHERE id=${id} RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const { id } = await context.params;
    const result = await db()`DELETE FROM matches WHERE id=${id} RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "Jogo não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
