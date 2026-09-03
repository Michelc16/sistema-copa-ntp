import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";

const phaseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  kind: z.enum(["group", "knockout"]),
  sortOrder: z.number().int().min(0).max(999),
  active: z.boolean(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = phaseSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados da fase inválidos." }, { status: 400 });
    const { id } = await context.params;
    const d = parsed.data;
    const result = await db()`UPDATE tournament_phases SET name=${d.name},kind=${d.kind},sort_order=${d.sortOrder},active=${d.active} WHERE id=${id} RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "Fase não encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const { id } = await context.params;
    const sql = db();
    const result = await sql.begin(async (tx) => {
      const [{ count }] = await tx<[{ count: number }]>`SELECT COUNT(*)::int AS count FROM matches WHERE phase=${id}`;
      if (count > 0) return { blocked: true, found: true };
      const deleted = await tx`DELETE FROM tournament_phases WHERE id=${id} RETURNING id`;
      return { blocked: false, found: deleted.length > 0 };
    });
    if (result.blocked) return NextResponse.json({ error: "Exclua ou mova os jogos desta fase antes de removê-la." }, { status: 409 });
    if (!result.found) return NextResponse.json({ error: "Fase não encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
