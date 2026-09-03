import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";
import { matchMutationSchema } from "@/lib/match-validation";
import { tournamentSeed } from "@/lib/seed-data";

export async function POST(request: Request) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = matchMutationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados do jogo inválidos." }, { status: 400 });

    const d = parsed.data;
    const id = randomUUID();
    const sql = db();
    const inserted = await sql.begin(async (tx) => {
      const phase = await tx<{ id: string }[]>`SELECT id FROM tournament_phases WHERE id=${d.phase} AND tournament_id=${tournamentSeed.id} FOR UPDATE`;
      if (!phase.length) return false;
      const [{ next_order }] = await tx<[{ next_order: number }]>`SELECT COALESCE(MAX(sort_order),0)+1 AS next_order FROM matches WHERE tournament_id=${tournamentSeed.id}`;
      await tx`
        INSERT INTO matches (id,tournament_id,phase,group_name,round_label,home_team_id,away_team_id,scheduled_at,court,status,sets,notes,sort_order)
        VALUES (${id},${tournamentSeed.id},${d.phase},${d.groupName},${d.roundLabel},${d.homeTeamId},${d.awayTeamId},${d.scheduledAt},${d.court},${d.status},${tx.json(d.sets)},${d.notes},${next_order})
      `;
      return true;
    });
    if (!inserted) return NextResponse.json({ error: "Fase não encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
