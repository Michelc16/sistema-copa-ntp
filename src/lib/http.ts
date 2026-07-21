import { NextResponse } from "next/server";
import { isSameOrigin, verifyAdmin } from "./auth";

export async function authorizeMutation(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origem da requisição inválida." }, { status: 403 });
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  return null;
}

export function apiError(error: unknown) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error("[API Error]", errorMsg, error);
  
  // Database configuration error
  if (errorMsg === "DATABASE_URL_NOT_CONFIGURED") {
    return NextResponse.json({ error: "Configure o banco Neon antes de salvar alterações." }, { status: 503 });
  }
  
  // Database connection error (timeout, refused, etc)
  if (errorMsg.includes("connect") || errorMsg.includes("timeout") || errorMsg.includes("ECONNREFUSED")) {
    return NextResponse.json({ error: "Banco de dados indisponível. Tente novamente em alguns segundos." }, { status: 503 });
  }
  
  // Database syntax/query error
  if (errorMsg.includes("syntax") || errorMsg.includes("constraint")) {
    return NextResponse.json({ error: `Erro ao processar dados: ${errorMsg}` }, { status: 400 });
  }
  
  // Default error
  const msg = process.env.NODE_ENV === "development" ? errorMsg : "Não foi possível concluir a operação.";
  return NextResponse.json({ error: msg }, { status: 500 });
}
