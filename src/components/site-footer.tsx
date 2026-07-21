import Link from "next/link";
import { AtSign, MapPin, ShieldCheck, Volleyball } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <span className="footer-title"><Volleyball size={22} /> 4ª Copa NTP</span>
          <p>Juntos em quadra, unidos pela diversidade.</p>
        </div>
        <div>
          <strong>Competição</strong>
          <Link href="/jogos">Tabela de jogos</Link>
          <Link href="/classificacao">Classificação</Link>
          <Link href="/equipes">Equipes e atletas</Link>
        </div>
        <div>
          <strong>Informações</strong>
          <span><MapPin size={15} /> Belo Horizonte - MG</span>
          <span><AtSign size={15} /> @naotempasse</span>
          <Link href="/admin/login"><ShieldCheck size={15} /> Acesso administrativo</Link>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 Copa NTP • Respeito, inclusão e espírito esportivo</div>
    </footer>
  );
}
