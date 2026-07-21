# 4ª Copa NTP — sistema oficial do campeonato

Sistema web completo e responsivo para organizar a 4ª Copa NTP de vôlei. A área pública não exige cadastro. Somente a conta administrativa configurada nas variáveis de ambiente pode alterar informações.

## O que está pronto

- Página inicial profissional com identidade visual NTP, comunicado, próximos jogos e resumo da classificação.
- Calendário com fase de grupos, semifinais, disputa de 3º lugar e final.
- Placar completo, incluindo resultado de cada set e status “ao vivo”.
- Classificação automática por grupos a partir dos resultados.
- Ajuste administrativo de pontos para punição, W.O., bônus ou correção.
- Oito equipes e 56 atletas cadastrados conforme o material fornecido.
- Página de equipes e elencos, regulamento editável e chaveamento das finais.
- Painel protegido para editar campeonato, equipes, atletas, jogos, placares, regras e pontuação.
- Modo de demonstração: o site funciona com os dados iniciais mesmo antes de conectar o Neon.
- Banco PostgreSQL preparado para Neon e implantação preparada para Vercel.
- Proteção por cookie HTTP-only, JWT com validade de 8 horas, SameSite estrito, validação de origem e validação de todos os dados recebidos.

## Implantação no Vercel + Neon

### 1. Criar o banco no Neon

1. Crie um projeto em `https://console.neon.tech`.
2. Abra **Connect** e copie a connection string PostgreSQL com `sslmode=require`.
3. Guarde esse valor para a variável `DATABASE_URL`.

### 2. Publicar o projeto

1. Descompacte este projeto e envie os arquivos para um repositório no GitHub.
2. No Vercel, clique em **Add New > Project** e importe o repositório.
3. O Vercel reconhecerá automaticamente o Next.js. Não altere os comandos de build.
4. Em **Settings > Environment Variables**, adicione todas as variáveis:

```env
DATABASE_URL=postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require
ADMIN_EMAIL=seu-email@dominio.com
ADMIN_PASSWORD=uma-senha-forte-com-pelo-menos-10-caracteres
JWT_SECRET=um-segredo-longo-e-aleatorio-com-mais-de-32-caracteres
SETUP_SECRET=outra-chave-longa-e-aleatoria
```

Você pode gerar segredos pelo terminal:

```bash
openssl rand -base64 48
```

Use um valor diferente para `JWT_SECRET` e `SETUP_SECRET`. Nunca envie o arquivo `.env.local` ao GitHub.

### 3. Criar as tabelas e os dados iniciais

Depois do primeiro deploy, abra:

```text
https://SEU-DOMINIO.vercel.app/configurar
```

Informe o valor definido em `SETUP_SECRET`. Essa ação cria as tabelas e cadastra campeonato, regras, equipes, atletas e 16 partidas. Pode ser executada novamente sem apagar alterações existentes.

### 4. Entrar no painel

Abra `/admin/login` e entre com `ADMIN_EMAIL` e `ADMIN_PASSWORD`. O público continuará acessando o site normalmente, mas não terá acesso às operações de edição.

## Desenvolvimento local

Requisitos: Node.js 20.9 ou superior e um banco Neon/PostgreSQL.

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

O site abrirá em `http://localhost:3000`. Se `DATABASE_URL` não estiver preenchida, o site abrirá em modo de demonstração.

## Pontuação configurada

- Vitória por 2 sets a 0: vencedor recebe 3 pontos.
- Vitória por 2 sets a 1: vencedor recebe 2 pontos e perdedor recebe 1 ponto.
- Ordem de desempate automática: pontos, vitórias, saldo de sets e saldo de pontos.
- O confronto direto permanece indicado no regulamento e pode ser resolvido com o ajuste administrativo quando todos os critérios anteriores empatarem.

## Comandos de qualidade

```bash
npm run typecheck
npm run lint
npm run build
```

## Rotas principais

| Rota | Função |
| --- | --- |
| `/` | Página inicial |
| `/jogos` | Jogos, datas e resultados |
| `/classificacao` | Classificação e mata-mata |
| `/equipes` | Equipes e atletas |
| `/regras` | Regulamento oficial |
| `/admin/login` | Login da organização |
| `/admin` | Painel protegido |
| `/configurar` | Configuração inicial do Neon |
| `/api/health` | Diagnóstico de conexão |

## Observações antes de divulgar

- Confirme o nome exato de cada atleta no painel; os nomes iniciais foram transcritos da planilha enviada.
- O calendário inicial distribui a fase de grupos em turno único e reserva 28/11 e 29/11 para semifinais, 05/12 para 3º lugar e 06/12 para a final.
- Revise o nome da quadra, cidade e perfil de Instagram na primeira publicação.
- Marque uma partida como **Encerrado** somente depois de preencher ao menos dois sets válidos; a classificação usa apenas partidas encerradas.
