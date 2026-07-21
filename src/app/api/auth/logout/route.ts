import { NextResponse } from "next/server";
import { clearSessionCookie, isSameOrigin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearSessionCookie());
  return response;
}
