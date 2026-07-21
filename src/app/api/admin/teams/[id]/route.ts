import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";

const teamSchema = z.object({ name: z.string().trim().min(2).max(100), groupName: z.enum(["A", "B"]), color: z.string().regex(/^#[0-9a-fA-F]{6}$/), captain: z.string().trim().max(100), active: z.boolean() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = teamSchema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados da equipe inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const { id } = await context.params; const d = parsed.data;
    const result = await db()`UPDATE teams SET name=${d.name}, group_name=${d.groupName}, color=${d.color}, captain=${d.captain}, active=${d.active}, updated_at=NOW() WHERE id=${id} RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "Equipe não encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
