"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { DatabaseZap } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function SetupPage() {
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState(""); const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try { const response = await fetch("/api/setup", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({secret:form.get("secret")}) }); const result=await response.json(); if(!response.ok) throw new Error(result.error); setSuccess(true); setMessage(`Configuração concluída: ${result.phases} fases, ${result.teams} equipes, ${result.players} atletas e ${result.matches} jogos.`); }
    catch(error){ setSuccess(false); setMessage(error instanceof Error?error.message:"Falha na configuração."); } finally{setLoading(false);}
  }
  return <main className="setup-page"><section className="setup-card"><BrandMark /><DatabaseZap color="#f59e0b" /><h1>Configurar banco de dados</h1><p>Informe a sua SETUP_SECRET após o primeiro deploy ou quando houver uma atualização estrutural. A operação aplica somente as migrações pendentes e é segura para repetir.</p><form className="login-form" onSubmit={submit}><div className="form-field"><label htmlFor="secret">Chave de configuração</label><input id="secret" name="secret" type="password" required autoComplete="off" /></div>{message && <div className={success?"admin-demo-warning":"login-message"}>{message}</div>}<button className="button button-primary" disabled={loading}>{loading?"Configurando...":"Atualizar estrutura e dados"}</button></form>{success && <Link className="back-link" href="/admin/login">Ir para o acesso administrativo →</Link>}<Link className="back-link" href="/">Voltar ao site</Link></section></main>;
}
