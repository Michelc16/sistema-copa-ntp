"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push("/admin"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha no acesso."); }
    finally { setLoading(false); }
  }

  return <main className="login-page"><section className="login-card"><BrandMark /><LockKeyhole color="#f59e0b" /><h1>Painel da organização</h1><p>Apenas o administrador autorizado pode alterar placares, equipes, jogadores e regras.</p><form className="login-form" onSubmit={submit}><div className="form-field"><label htmlFor="email">E-mail administrativo</label><input id="email" name="email" type="email" autoComplete="username" required /></div><div className="form-field"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>{message && <div className="login-message">{message}</div>}<button className="button button-primary" disabled={loading}>{loading ? "Entrando..." : "Entrar com segurança"}</button></form><Link className="back-link" href="/">← Voltar ao site do campeonato</Link></section></main>;
}
