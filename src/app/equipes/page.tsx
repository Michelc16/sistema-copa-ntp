import { Crown, Shirt, UsersRound } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTournamentView } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const data = await getTournamentView();
  return <><SiteHeader /><main><PageHero eyebrow="56 atletas" title="Equipes e elencos" description="Conheça quem vai entrar em quadra na 4ª Copa NTP." />
    <section className="section"><div className="container"><div className="team-groups">
      {(["A", "B"] as const).map((group) => <div key={group} className="team-group"><div className="schedule-heading"><h2>Grupo {group}</h2><span>4 equipes</span></div><div className="teams-grid">{data.teams.filter((team) => team.groupName === group && team.active).map((team) => <article className="team-card" key={team.id} style={{ "--team-color": team.color } as React.CSSProperties}><div className="team-card-head"><span className="large-orb">{team.code}</span><div><small>GRUPO {team.groupName}</small><h3>{team.name}</h3><span><UsersRound size={14} /> {team.players.filter((player) => player.active).length} atletas</span></div></div><ul>{team.players.filter((player) => player.active).map((player) => <li key={player.id}><span className="player-number">{player.shirtNumber ?? <Shirt size={14} />}</span><b>{player.name}</b>{player.isCaptain && <span className="captain-tag"><Crown size={12} /> capitão</span>}</li>)}</ul></article>)}</div></div>)}
    </div></div></section>
  </main><SiteFooter /></>;
}
