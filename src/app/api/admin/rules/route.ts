import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";
import { tournamentSeed } from "@/lib/seed-data";

const rulesSchema = z.object({
  format: z.array(z.string().trim().min(1).max(400)).max(30),
  competition: z.array(z.string().trim().min(1).max(400)).max(30),
  infractions: z.array(z.string().trim().min(1).max(400)).max(30),
  schedule: z.array(z.string().trim().min(1).max(400)).max(30),
  conduct: z.array(z.string().trim().min(1).max(400)).max(30),
  scoring: z.array(z.string().trim().min(1).max(400)).max(30),
});

export async function PATCH(request: Request) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = rulesSchema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Regulamento inválido.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const sql = db();
    const result = await sql`UPDATE tournaments SET rules=${sql.json(parsed.data)}, updated_at=NOW() WHERE id=${tournamentSeed.id} RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "Torneio não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
