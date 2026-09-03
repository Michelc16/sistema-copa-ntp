import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";
import { tournamentSeed } from "@/lib/seed-data";

const phaseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  kind: z.enum(["group", "knockout"]),
});

export async function POST(request: Request) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = phaseSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados da fase inválidos." }, { status: 400 });
    const d = parsed.data;
    const id = `phase-${randomUUID()}`;
    const sql = db();
    const [{ next_order }] = await sql<[{ next_order: number }]>`SELECT COALESCE(MAX(sort_order),0)+1 AS next_order FROM tournament_phases WHERE tournament_id=${tournamentSeed.id}`;
    await sql`INSERT INTO tournament_phases (id,tournament_id,name,kind,sort_order,active) VALUES (${id},${tournamentSeed.id},${d.name},${d.kind},${next_order},TRUE)`;
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
