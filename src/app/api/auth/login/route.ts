import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminToken, isSameOrigin, sessionCookie, validateCredentials } from "@/lib/auth";

const loginSchema = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(300) });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Informe e-mail e senha válidos." }, { status: 400 });
    if (!validateCredentials(parsed.data.email, parsed.data.password)) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }
    const token = await createAdminToken(parsed.data.email);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie(token));
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "As credenciais do administrador ainda não foram configuradas." }, { status: 503 });
  }
}
