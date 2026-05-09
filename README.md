# rm-diagram

> A personal life-management platform for tracking habits, finances, goals, daily notes, and AI-powered insights — built as a full-stack monorepo.

[![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Ollama](https://img.shields.io/badge/Ollama-qwen3:8b-000000?logo=ollama&logoColor=white)](https://ollama.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Screenshots

> _Screenshots coming soon — drop PNGs into `docs/screenshots/` and reference them here._

| Dashboard | Habits | Finance |
| :---: | :---: | :---: |
| _placeholder_ | _placeholder_ | _placeholder_ |

| Goals | Notes | AI Assistant |
| :---: | :---: | :---: |
| _placeholder_ | _placeholder_ | _placeholder_ |

---

## Features

- **Authentication** — email/password sign-up & login with JWT access tokens and refresh-token rotation.
- **Dashboard** — at-a-glance overview of today's habits, recent transactions, active goals, and latest notes.
- **Habit Tracking** — create habits, log daily completions, and visualise streaks on a calendar grid.
- **Finance** — record income & expenses, categorise transactions, and track monthly trends with charts.
- **Goals & Milestones** — define long-term goals, break them into milestones, and track status.
- **Daily Notes** — journal entries tagged with mood, searchable by date.
- **AI Assistant** — local LLM integration via **Ollama** (`qwen3:8b` by default) for journal summarisation and insights.
- **User Settings** — profile, preferences, and account management.
- **API Docs** — interactive Swagger UI for exploring every endpoint.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Java 21, Spring Boot 4, Spring Security, Spring Data JPA, MapStruct, Lombok |
| Database | PostgreSQL 16, Flyway migrations |
| Auth | JWT (jjwt 0.12) with refresh tokens |
| AI | Ollama (local LLM, default model `qwen3:8b`) |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5 |
| UI | Tailwind CSS 4, shadcn/ui, Base UI, Lucide icons |
| Data layer | TanStack Query, Axios, Zustand, React Hook Form + Zod |
| API Docs | springdoc-openapi (Swagger UI) |
| Testing | JUnit 5, Mockito, Testcontainers |
| Infra | Docker Compose (Postgres + pgAdmin) |

---

## Architecture

```
┌──────────────────────────┐         ┌──────────────────────────┐
│        Next.js 16        │  HTTPS  │     Spring Boot 4 API    │
│   (App Router, RSC)      │ ──────► │    /api/v1/*  + JWT      │
│                          │  JSON   │                          │
│  TanStack Query · Axios  │ ◄────── │  Controllers → Services  │
│  Zustand · Tailwind/shadcn│        │  → Repositories (JPA)    │
└──────────────────────────┘         └──────────┬─────────┬─────┘
                                                │         │
                                            JDBC│         │HTTP
                                                ▼         ▼
                                     ┌──────────────┐ ┌──────────────┐
                                     │ PostgreSQL16 │ │   Ollama     │
                                     │ (Flyway-mgd) │ │  (qwen3:8b)  │
                                     └──────────────┘ └──────────────┘

                            pgAdmin (dev only, :5050)
```

The backend is organised **package-by-feature** (`auth/`, `user/`, `habit/`, `finance/`, `goal/`, `note/`, `dashboard/`, `ai/`, `settings/`), each containing its own `Entity`, `Dto`, `Repository`, `Service`, and `Controller`. The frontend mirrors the same boundary with `src/features/{name}/` folders that own their `service.ts`, `hooks.ts`, `schema.ts`, `types.ts`, and `components/`.

---

## Getting Started

### Prerequisites

- **Java 21+** ([Temurin](https://adoptium.net/) recommended)
- **Maven 3.9+** (the included `./mvnw` wrapper also works)
- **Node.js 20+** and **npm** (or **pnpm**)
- **Docker** + **Docker Compose**
- **Ollama** — optional, only needed for the AI Assistant feature ([install guide](https://ollama.com/download))

### 1. Clone the repository

```bash
git clone https://github.com/astrostar41ust/rm-diagram.git
cd rm-diagram
```

### 2. Start PostgreSQL (and pgAdmin)

```bash
docker-compose up -d
```

This starts:

- PostgreSQL on `localhost:5432` (db: `rmdiagram`, user: `rmdiagram`, password: `rmdiagram_secret`)
- pgAdmin on `http://localhost:5050` (login: `admin@rmdiagram.com` / `admin`)

### 3. (Optional) Start Ollama for the AI feature

```bash
ollama pull qwen3:8b
ollama serve            # serves on http://localhost:11434
```

The model and URL are configurable in `backend/src/main/resources/application.yml` under `app.ai`.

### 4. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend starts on `http://localhost:8080`. Flyway applies all migrations automatically on first boot.

### 5. Run the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:3000`.

### Stopping everything

```bash
docker-compose down       # stop containers, keep data
docker-compose down -v    # stop containers and delete the database volume
```

---

## API Documentation

Once the backend is running, interactive Swagger UI is available at:

- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

All endpoints live under `/api/v1/*` and (except `auth/*`) require a `Bearer` JWT.

---

## Project Structure

```
rm-diagram/
├── backend/                         # Spring Boot 4 API
│   ├── src/main/java/com/rmdiagram/
│   │   ├── auth/                    # login, register, JWT, refresh tokens
│   │   ├── user/                    # user profile
│   │   ├── habit/                   # habits + daily completions
│   │   ├── finance/                 # categories + transactions
│   │   ├── goal/                    # goals + milestones
│   │   ├── note/                    # daily notes with mood
│   │   ├── dashboard/               # aggregated overview endpoint
│   │   ├── ai/                      # Ollama client + AI endpoints
│   │   ├── settings/                # user settings
│   │   ├── config/                  # security, OpenAPI, beans
│   │   └── exception/               # global error handler
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/            # Flyway scripts (V1__, V2__, …)
│   └── pom.xml
│
├── frontend/                        # Next.js 16 client
│   └── src/
│       ├── app/                     # App Router: (auth) + (dashboard) groups
│       ├── features/                # auth, dashboard, habit, finance,
│       │                            # goal, note, ai, settings
│       │   └── <feature>/
│       │       ├── components/
│       │       ├── hooks.ts         # TanStack Query hooks
│       │       ├── service.ts       # Axios calls
│       │       ├── schema.ts        # Zod validation
│       │       └── types.ts         # mirrors Java DTOs
│       ├── components/
│       │   ├── ui/                  # shadcn/ui primitives
│       │   └── shared/              # cross-feature components
│       ├── stores/                  # Zustand UI / auth state
│       ├── config/                  # sidebar config, etc.
│       └── lib/                     # api.ts, utils.ts
│
├── docker-compose.yml               # Postgres + pgAdmin
├── CLAUDE.md                        # AI assistant working rules
└── README.md
```

---

## Development Commands

### Backend

```bash
cd backend
./mvnw spring-boot:run        # start dev server
./mvnw test                   # run unit + integration tests
./mvnw clean install          # full build (produces fat jar)
```

### Frontend

```bash
cd frontend
npm run dev                   # dev server with HMR
npm run build                 # production build
npm run lint                  # ESLint
```

---

## Future Improvements

- **Recurring transactions** — schedule fixed income & expenses (rent, salary, subscriptions) so they post automatically.
- **Budgets & alerts** — set monthly limits per category and warn when spending approaches the cap.
- **Habit analytics** — heatmaps, streak history, and weekly/monthly trend charts.
- **Habit reminders** — per-habit time-of-day reminders and missed-day catch-up.
- **Goal automation** — link habits and transactions to goals so progress updates automatically as you log activity.
- **Note search & tags** — full-text search across notes and a tag system for grouping entries beyond mood.
- **Multi-currency support** — track transactions in multiple currencies with conversion to a base currency.
- **Data export / import** — CSV / JSON export and re-import for finance, habits, and notes.

---

## License

MIT — feel free to fork, learn from, or adapt for your own projects.
