import Image from "next/image";
import { CalendarClock, Gavel, Handshake, ListChecks, ShieldAlert, Trophy } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

const ruleGroups = [
  ["format", "Formato das partidas", ListChecks],
  ["competition", "Competição", Trophy],
  ["infractions", "Infrações observadas", ShieldAlert],
  ["schedule", "Horários", CalendarClock],
  ["conduct", "Conduta e fair play", Handshake],
  ["scoring", "Pontuação", Gavel],
] as const;

export default async function RulesPage() {
  const data = await getTournamentView();
  return <><SiteHeader /><main><PageHero eyebrow="Informações oficiais" title="Regulamento da competição" description="Regras claras para uma disputa organizada, inclusiva e com fair play." />
    <section className="section"><div className="container rules-layout"><div className="rules-grid">{ruleGroups.map(([key, title, Icon]) => <article className="rule-card" key={key}><span className="rule-icon"><Icon size={24} /></span><div><h2>{title}</h2><ul>{data.tournament.rules[key].map((rule, index) => <li key={index}>{rule}</li>)}</ul></div></article>)}</div><aside className="rules-poster"><Image src="/regulamento.jpeg" alt="Informações gerais da 4ª Copa NTP" width={1280} height={1280} /><small>Material oficial da organização</small></aside></div></section>
  </main><SiteFooter /></>;
}
