import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";

const playerSchema = z.object({ teamId: z.string().min(1).max(80), name: z.string().trim().min(2).max(100), shirtNumber: z.number().int().min(0).max(99).nullable(), isCaptain: z.boolean() });

export async function POST(request: Request) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = playerSchema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados do atleta inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const d = parsed.data; const id = randomUUID();
    const sql = db();
    const inserted = await sql.begin(async (tx) => {
      const team = await tx<{ id: string }[]>`SELECT id FROM teams WHERE id=${d.teamId} FOR UPDATE`;
      if (!team.length) return false;

      const [{ next_order }] = await tx<[{ next_order: number }]>`SELECT COALESCE(MAX(sort_order),0)+1 AS next_order FROM players WHERE team_id=${d.teamId}`;
      if (d.isCaptain) {
        await tx`UPDATE players SET is_captain=FALSE WHERE team_id=${d.teamId}`;
      }
      await tx`INSERT INTO players (id,team_id,name,shirt_number,is_captain,active,sort_order) VALUES (${id},${d.teamId},${d.name},${d.shirtNumber},${d.isCaptain},TRUE,${next_order})`;
      if (d.isCaptain) {
        await tx`UPDATE teams SET captain=${d.name} WHERE id=${d.teamId}`;
      }
      return true;
    });
    if (!inserted) return NextResponse.json({ error: "Equipe não encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true, id });
  } catch (error) { return apiError(error); }
}
