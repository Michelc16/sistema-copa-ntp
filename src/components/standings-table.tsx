import type { Standing } from "@/lib/types";

export function StandingsTable({ group, rows, compact = false }: { group: "A" | "B"; rows: Standing[]; compact?: boolean }) {
  return (
    <div className="standings-card">
      <div className="standings-title">
        <span>Grupo {group}</span>
        <small>2 primeiros avançam</small>
      </div>
      <div className="table-scroll">
        <table className="standings-table">
          <thead><tr><th>#</th><th>Equipe</th><th>J</th><th>V</th>{!compact && <><th>D</th><th>Sets</th><th>Saldo</th></>}<th>PTS</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.team.id} className={row.position <= 2 ? "qualified" : ""}>
                <td><b>{row.position}</b></td>
                <td><span className="table-team"><i style={{ background: row.team.color }} /> <strong>{row.team.name}</strong><small>{row.team.code}</small></span></td>
                <td>{row.played}</td><td>{row.wins}</td>
                {!compact && <><td>{row.losses}</td><td>{row.setsWon}:{row.setsLost}</td><td>{row.pointsFor - row.pointsAgainst}</td></>}
                <td><b className="points-badge">{row.points}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
