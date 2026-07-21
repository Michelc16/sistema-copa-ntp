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
    if (!parsed.success) return NextResponse.json({ error: "Cada regra deve ocupar uma linha válida." }, { status: 400 });
    const sql = db();
    await sql`UPDATE tournaments SET rules=${sql.json(parsed.data)}, updated_at=NOW() WHERE id=${tournamentSeed.id}`;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
