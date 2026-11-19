# Mouna platform

B2B supplies platform for Saudi companies. Project context: [CLAUDE.md](CLAUDE.md). Architecture: [docs/architecture](docs/architecture/README.md). Progress: [docs/ROADMAP.md](docs/ROADMAP.md).

## Layout

| Path | What | Local URL |
|---|---|---|
| `apps/web` | Marketing website | http://localhost:3000 |
| `apps/portal` | Client portal | http://localhost:3001 |
| `apps/ops` | Back office | http://localhost:3002 |
| `apps/field` | Field web app (drivers, technicians) | http://localhost:3003 |
| `apps/api` | Platform API (NestJS) | http://localhost:4000 |
| `packages/brand` | Colours, fonts, design tokens | |
| `packages/i18n` | Arabic/English helpers, SAR formatting | |
| `packages/ui` | Shared React components | |
| `tools` | Developer tools (local database) | |

## Requirements

- Node.js 26 LTS, pnpm 10
- Docker is optional. This development machine has virtualization disabled in its firmware, so local PostgreSQL runs without Docker (`pnpm db:local`). Machines with Docker can use `pnpm db:up` instead.

## First run

```powershell
pnpm install
```

```powershell
Copy-Item .env.example .env
```

Then, in one terminal:

```powershell
pnpm db:local
```

and in another:

```powershell
pnpm dev
```

Check the API: http://localhost:4000/health/ready should answer `{"status":"ok","database":"ok"}`.

## Everyday commands

| Command | Does |
|---|---|
| `pnpm dev` | Runs all apps and the API with live reload |
| `pnpm build` | Production build of everything |
| `pnpm typecheck` | Type-checks every package |
| `pnpm test` | Runs all tests |
| `pnpm db:local` | Starts PostgreSQL on port 5432 without Docker (data in `.data/pg`) |

## Conventions

- Arabic is the default locale; every client-facing text is stored in both languages.
- Money is stored as integer halalas, never floating point.
- Stock, invoices, payments and credit are append-only ledgers; corrections are new entries.
