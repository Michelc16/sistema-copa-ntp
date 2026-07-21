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
    const [{ next_order }] = await db()<[{ next_order: number }]>`SELECT COALESCE(MAX(sort_order),0)+1 AS next_order FROM players WHERE team_id=${d.teamId}`;
    await db()`INSERT INTO players (id,team_id,name,shirt_number,is_captain,active,sort_order,created_at) VALUES (${id},${d.teamId},${d.name},${d.shirtNumber},${d.isCaptain},TRUE,${next_order},NOW())`;
    return NextResponse.json({ ok: true, id });
  } catch (error) { return apiError(error); }
}
