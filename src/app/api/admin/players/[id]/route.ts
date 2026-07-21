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
    const sql = db();
    const result = await sql.begin(async (tx) => {
      // Lock the team as well as the player so two concurrent captain changes
      // cannot leave more than one captain in the same squad.
      const current = await tx<{ id: string; team_id: string }[]>`
        SELECT p.id, p.team_id
        FROM players p
        JOIN teams t ON t.id = p.team_id
        WHERE p.id = ${id}
        FOR UPDATE OF p, t
      `;
      if (!current.length) return null;

      const teamId = current[0].team_id;
      if (d.isCaptain) {
        await tx`UPDATE players SET is_captain=FALSE WHERE team_id=${teamId} AND id<>${id}`;
      }

      await tx`
        UPDATE players
        SET name=${d.name}, shirt_number=${d.shirtNumber}, is_captain=${d.isCaptain}, active=${d.active}
        WHERE id=${id}
      `;

      // Keep the legacy representative field synchronized with the roster.
      const captain = await tx<{ name: string }[]>`
        SELECT name FROM players
        WHERE team_id=${teamId} AND is_captain=TRUE AND active=TRUE
        ORDER BY sort_order, name
        LIMIT 1
      `;
      await tx`UPDATE teams SET captain=${captain[0]?.name ?? ""} WHERE id=${teamId}`;

      return { teamId, captain: captain[0]?.name ?? "" };
    });
    if (!result) return NextResponse.json({ error: "Atleta não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const { id } = await context.params;
    const sql = db();
    const deleted = await sql.begin(async (tx) => {
      const current = await tx<{ id: string; team_id: string }[]>`
        SELECT p.id, p.team_id
        FROM players p
        JOIN teams t ON t.id = p.team_id
        WHERE p.id=${id}
        FOR UPDATE OF p, t
      `;
      if (!current.length) return false;

      const teamId = current[0].team_id;
      await tx`DELETE FROM players WHERE id=${id}`;
      const captain = await tx<{ name: string }[]>`
        SELECT name FROM players
        WHERE team_id=${teamId} AND is_captain=TRUE AND active=TRUE
        ORDER BY sort_order, name
        LIMIT 1
      `;
      await tx`UPDATE teams SET captain=${captain[0]?.name ?? ""} WHERE id=${teamId}`;
      return true;
    });
    if (!deleted) return NextResponse.json({ error: "Atleta não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
