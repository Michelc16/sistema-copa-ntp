import type { Match, Player, Team, Tournament } from "./types";

export const tournamentSeed: Tournament = {
  id: "copa-ntp-2026",
  slug: "4-copa-ntp",
  name: "Copa NTP",
  edition: "4ª edição",
  subtitle: "Jogos de agosto a dezembro",
  description:
    "Uma competição feita para celebrar o voleibol, a amizade e a diversidade. Respeito dentro e fora da quadra, inclusão e espírito esportivo em cada partida.",
  venue: "Quadra Não Tem Passe",
  city: "Belo Horizonte - MG",
  startDate: "2026-08-29",
  endDate: "2026-12-06",
  announcement: "Abertura em 29 de agosto. Venha para a quadra!",
  rules: {
    format: [
      "Todos os jogos serão disputados em melhor de 3 sets.",
      "Cada set será disputado até 25 pontos, com diferença mínima de 2 pontos.",
      "O formato vale para fase classificatória, semifinais, disputa de 3º lugar e final.",
    ],
    competition: [
      "Participação de 8 equipes, com 7 atletas por equipe.",
      "Competição dividida em 2 grupos com 4 equipes cada.",
      "Todas as equipes deverão possuir a mesma quantidade de atletas femininas.",
      "Os dois primeiros colocados de cada grupo avançam às semifinais.",
    ],
    infractions: [
      "Invasão da linha no saque.",
      "Invasão da linha de 3 metros em ataque do fundo.",
      "Toque na rede.",
      "Invasão por cima ou por baixo da rede.",
      "Dois toques e condução.",
      "Rotação 5x1, 6x0 ou 6x0 com infiltração do levantador.",
    ],
    schedule: [
      "Sábados: aquecimento às 08h00, jogos das 08h30 às 10h30.",
      "Domingos: jogos das 10h30 às 12h30.",
      "O aquecimento ocorrerá 30 minutos antes do primeiro jogo.",
      "As partidas começarão pontualmente.",
    ],
    conduct: [
      "Equipes sem o número mínimo de atletas perderão a partida por W.O.",
      "Somente o representante ou capitão poderá conversar com a arbitragem.",
      "Respeito, inclusão e espírito esportivo são obrigatórios.",
    ],
    scoring: [
      "Vitória por 2 sets a 0: 3 pontos para o vencedor.",
      "Vitória por 2 sets a 1: 2 pontos para o vencedor e 1 ponto para o perdedor.",
      "Desempate: vitórias, saldo de sets, saldo de pontos e confronto direto.",
    ],
  },
};

const teamDefinitions = [
  { code: "A1", groupName: "A", color: "#f4d40b", players: ["David Samuel", "Nathalia Thaty", "Ricardo Rodrigues", "Michel Cardoso", "Tiago Matiole", "Reinaldo", "Lucas Kumaira"] },
  { code: "A2", groupName: "A", color: "#ef9eb1", players: ["Samuel Brum", "Ana Flávia", "Lucas Freitas", "Alen Silva", "Tiago Noce", "Tiago Alexandre de Oliveira", "Lucas Dornellas"] },
  { code: "A3", groupName: "A", color: "#f3c94f", players: ["Thamirys Campos", "Joãozinho", "Patrick Siqueira", "Eros", "Leonardo Vinicius Ribeiro", "Jorge Leal", "Tomás Costa"] },
  { code: "A4", groupName: "A", color: "#48c9cc", players: ["AnaLu", "Lucas Reis", "Felipe Gontijo", "Jorge Henrique Quixabeira", "Wanderson Matheus", "Frederico Oliveira", "Junior"] },
  { code: "B1", groupName: "B", color: "#f2a56f", players: ["Vinucius Moreira", "Paulo Ângelo", "Guilherme Paula", "Pedro Leal", "Arthur Rocha", "Miaw", "Vitor Correa"] },
  { code: "B2", groupName: "B", color: "#b8d9a7", players: ["Renata Araújo", "Arthur Lopes - Azeitona", "João Marcelo Castro", "Tiago Nascimento", "Raphael Campos", "Marcelo Cândido", "Adilson Sasse"] },
  { code: "B3", groupName: "B", color: "#b58702", players: ["Bruna Espechit", "Gusmão", "Felipe Atene", "Fernando Abath", "Alexandre Azevedo", "Alice Alem", "Yarik Ribeiro"] },
  { code: "B4", groupName: "B", color: "#7f9bb8", players: ["Laura Malheiros", "Nick Andrade", "Matheus Franco", "Marcelo Viana", "Robert Andrade", "Gabriel Maciel", "Ítalo Almeida"] },
] as const;

export const teamSeeds: Team[] = teamDefinitions.map((definition, teamIndex) => {
  const id = definition.code.toLowerCase();
  const players: Player[] = definition.players.map((name, playerIndex) => ({
    id: `${id}-p${playerIndex + 1}`,
    teamId: id,
    name,
    shirtNumber: null,
    isCaptain: playerIndex === 0,
    active: true,
    sortOrder: playerIndex + 1,
  }));

  return {
    id,
    tournamentId: tournamentSeed.id,
    code: definition.code,
    name: `Equipe ${definition.code}`,
    groupName: definition.groupName,
    color: definition.color,
    captain: players[0]?.name ?? "",
    sortOrder: teamIndex + 1,
    active: true,
    players,
  };
});

type MatchSeedInput = Omit<Match, "tournamentId" | "court" | "status" | "sets" | "notes"> & Partial<Pick<Match, "court" | "status" | "sets" | "notes">>;

const matches: MatchSeedInput[] = [
  { id: "g1", phase: "group", groupName: "A", roundLabel: "1ª rodada", homeTeamId: "a1", awayTeamId: "a2", scheduledAt: "2026-08-29T08:30:00-03:00", sortOrder: 1 },
  { id: "g2", phase: "group", groupName: "B", roundLabel: "1ª rodada", homeTeamId: "b1", awayTeamId: "b2", scheduledAt: "2026-08-29T09:30:00-03:00", sortOrder: 2 },
  { id: "g3", phase: "group", groupName: "A", roundLabel: "1ª rodada", homeTeamId: "a3", awayTeamId: "a4", scheduledAt: "2026-08-30T10:30:00-03:00", sortOrder: 3 },
  { id: "g4", phase: "group", groupName: "B", roundLabel: "1ª rodada", homeTeamId: "b3", awayTeamId: "b4", scheduledAt: "2026-08-30T11:30:00-03:00", sortOrder: 4 },
  { id: "g5", phase: "group", groupName: "A", roundLabel: "2ª rodada", homeTeamId: "a1", awayTeamId: "a3", scheduledAt: "2026-09-26T08:30:00-03:00", sortOrder: 5 },
  { id: "g6", phase: "group", groupName: "B", roundLabel: "2ª rodada", homeTeamId: "b1", awayTeamId: "b3", scheduledAt: "2026-09-26T09:30:00-03:00", sortOrder: 6 },
  { id: "g7", phase: "group", groupName: "A", roundLabel: "2ª rodada", homeTeamId: "a2", awayTeamId: "a4", scheduledAt: "2026-09-27T10:30:00-03:00", sortOrder: 7 },
  { id: "g8", phase: "group", groupName: "B", roundLabel: "2ª rodada", homeTeamId: "b2", awayTeamId: "b4", scheduledAt: "2026-09-27T11:30:00-03:00", sortOrder: 8 },
  { id: "g9", phase: "group", groupName: "A", roundLabel: "3ª rodada", homeTeamId: "a1", awayTeamId: "a4", scheduledAt: "2026-10-31T08:30:00-03:00", sortOrder: 9 },
  { id: "g10", phase: "group", groupName: "B", roundLabel: "3ª rodada", homeTeamId: "b1", awayTeamId: "b4", scheduledAt: "2026-10-31T09:30:00-03:00", sortOrder: 10 },
  { id: "g11", phase: "group", groupName: "A", roundLabel: "3ª rodada", homeTeamId: "a2", awayTeamId: "a3", scheduledAt: "2026-11-01T10:30:00-03:00", sortOrder: 11 },
  { id: "g12", phase: "group", groupName: "B", roundLabel: "3ª rodada", homeTeamId: "b2", awayTeamId: "b3", scheduledAt: "2026-11-01T11:30:00-03:00", sortOrder: 12 },
  { id: "sf1", phase: "semifinal", groupName: null, roundLabel: "Semifinal 1", homeTeamId: null, awayTeamId: null, scheduledAt: "2026-11-28T08:30:00-03:00", sortOrder: 13, notes: "1º Grupo A x 2º Grupo B" },
  { id: "sf2", phase: "semifinal", groupName: null, roundLabel: "Semifinal 2", homeTeamId: null, awayTeamId: null, scheduledAt: "2026-11-29T10:30:00-03:00", sortOrder: 14, notes: "1º Grupo B x 2º Grupo A" },
  { id: "third", phase: "third_place", groupName: null, roundLabel: "Disputa de 3º lugar", homeTeamId: null, awayTeamId: null, scheduledAt: "2026-12-05T08:30:00-03:00", sortOrder: 15, notes: "Perdedores das semifinais" },
  { id: "final", phase: "final", groupName: null, roundLabel: "Grande final", homeTeamId: null, awayTeamId: null, scheduledAt: "2026-12-06T10:30:00-03:00", sortOrder: 16, notes: "Vencedores das semifinais" },
];

export const matchSeeds: Match[] = matches.map((match) => ({
  ...match,
  tournamentId: tournamentSeed.id,
  court: match.court ?? "Quadra principal",
  status: match.status ?? "scheduled",
  sets: match.sets ?? [],
  notes: match.notes ?? "",
}));
