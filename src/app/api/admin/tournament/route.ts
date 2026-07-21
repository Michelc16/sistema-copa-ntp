import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, authorizeMutation } from "@/lib/http";
import { tournamentSeed } from "@/lib/seed-data";

const schema = z.object({
  name: z.string().trim().min(2).max(120), edition: z.string().trim().min(1).max(60),
  subtitle: z.string().trim().max(180), description: z.string().trim().max(1000),
  venue: z.string().trim().max(160), city: z.string().trim().max(160),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), announcement: z.string().trim().max(300),
});

export async function PATCH(request: Request) {
  const denied = await authorizeMutation(request); if (denied) return denied;
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados do torneio inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const d = parsed.data;
    const result = await db()`UPDATE tournaments SET name=${d.name}, edition=${d.edition}, subtitle=${d.subtitle}, description=${d.description}, venue=${d.venue}, city=${d.city}, start_date=${d.startDate}, end_date=${d.endDate}, announcement=${d.announcement}, updated_at=NOW() WHERE id=${tournamentSeed.id} RETURNING id`;
    if (!result.length) return NextResponse.json({ error: "Torneio não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
