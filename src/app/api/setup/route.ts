import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth";
import { setupDatabase } from "@/lib/setup-database";

function safeEqual(left: string, right: string) {
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const expected = process.env.SETUP_SECRET;
  const { secret } = await request.json().catch(() => ({ secret: "" }));
  if (!expected || expected.length < 16 || typeof secret !== "string" || !safeEqual(secret, expected)) {
    return NextResponse.json({ error: "Chave de configuração inválida." }, { status: 401 });
  }
  try {
    const result = await setupDatabase();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível configurar o banco. Confira a DATABASE_URL." }, { status: 500 });
  }
}
