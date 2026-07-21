import { NextResponse } from "next/server";
import { isSameOrigin, verifyAdmin } from "./auth";

export async function authorizeMutation(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origem da requisição inválida." }, { status: 403 });
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  return null;
}

export function apiError(error: unknown) {
  console.error(error);
  if (error instanceof Error && error.message === "DATABASE_URL_NOT_CONFIGURED") {
    return NextResponse.json({ error: "Configure o banco Neon antes de salvar alterações." }, { status: 503 });
  }
  return NextResponse.json({ error: "Não foi possível concluir a operação." }, { status: 500 });
}
