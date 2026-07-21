import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";

const schema = z.object({ points: z.number().int().min(-99).max(99), reason: z.string().trim().max(200) });

export async function PUT(request: Request, context: { params: Promise<{ teamId: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Ajuste inválido.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const { teamId } = await context.params; const d = parsed.data;
    await db()`INSERT INTO standing_adjustments(team_id,points,reason,updated_at) VALUES(${teamId},${d.points},${d.reason},NOW()) ON CONFLICT(team_id) DO UPDATE SET points=EXCLUDED.points,reason=EXCLUDED.reason,updated_at=NOW()`;
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
