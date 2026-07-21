import { setupDatabase } from "../src/lib/setup-database";

if (!process.env.DATABASE_URL) {
  console.error("Defina DATABASE_URL antes de executar npm run db:setup.");
  process.exit(1);
}

setupDatabase()
  .then((result) => {
    console.log(`Banco configurado: ${result.teams} equipes, ${result.players} atletas e ${result.matches} jogos.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Falha ao configurar o banco:", error);
    process.exit(1);
  });
