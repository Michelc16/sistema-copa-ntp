import Link from "next/link";
import { BrandMark } from "./brand-mark";

const links = [
  ["/", "Início"],
  ["/jogos", "Jogos"],
  ["/classificacao", "Classificação"],
  ["/equipes", "Equipes"],
  ["/regras", "Regras"],
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-link"><BrandMark /></Link>
        <nav className="main-nav" aria-label="Navegação principal">
          {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <Link className="admin-link" href="/admin/login">Área do administrador</Link>
      </div>
    </header>
  );
}
