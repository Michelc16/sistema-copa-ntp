import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";

const schema = z.object({ name: z.string().trim().min(2).max(100), shirtNumber: z.number().int().min(0).max(99).nullable(), isCaptain: z.boolean(), active: z.boolean() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados do atleta inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const { id } = await context.params; const d = parsed.data;
    const result = await db()`UPDATE players SET name=${d.name},shirt_number=${d.shirtNumber},is_captain=${d.isCaptain},active=${d.active},updated_at=NOW() WHERE id=${id} RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "Atleta não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const { id } = await context.params;
    const result = await db()`DELETE FROM players WHERE id=${id} RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "Atleta não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
