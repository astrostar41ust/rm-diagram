# rm-diagram — Claude Code Instructions

## Project Overview
Personal life management SaaS: habit tracking, income/expense tracking,
goals, and daily notes. Monorepo with Java Spring Boot backend and
Next.js frontend.

## Architecture
- backend/  → Java 21, Spring Boot 3, Maven, PostgreSQL
- frontend/ → Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui

## Backend Rules

### Structure
- Package-by-feature: src/main/java/com/rmdiagram/{feature}/
- Each feature has: Entity, DTO, Repository, Service, Controller
- Shared code in config/, exception/

### Conventions
- Use @RequiredArgsConstructor for dependency injection, NEVER @Autowired
- ALWAYS use DTOs, never expose entities in API responses
- All business logic in Service layer, controllers are thin
- Use Lombok: @Data, @Builder, @Slf4j, @RequiredArgsConstructor
- REST endpoints: /api/v1/{resource}
- Always return ResponseEntity with explicit HTTP status codes
- Use BigDecimal for all money/financial values, never double/float
- Use LocalDateTime for dates, never java.util.Date

### Database
- Flyway for ALL schema changes, never use ddl-auto=create/update
- Migration naming: V{number}__{description}.sql (double underscore)
- Always add indexes for columns used in WHERE clauses

### Error Handling
- All exceptions go through GlobalExceptionHandler
- Custom exceptions extend RuntimeException
- Return consistent ErrorResponse body: { code, message }

### Testing
- JUnit 5 + Mockito for unit tests
- Testcontainers for integration tests
- Test file naming: {ClassName}Test.java

## Frontend Rules

## Frontend Rules

### Structure
- Feature modules in src/features/{feature}/
- Each feature contains: components/, hooks.ts, service.ts, 
  schema.ts, types.ts
- Pages in src/app/ are thin — only import and compose from features
- Shared UI in src/components/ui/ (shadcn) and src/components/shared/
- Global state only in src/stores/ (UI concerns like sidebar, theme)
- Shared utilities in src/lib/ (api.ts, utils.ts)

### Feature file responsibilities
- service.ts — raw API calls using Axios, no React
- hooks.ts — TanStack Query wrappers around service functions
- schema.ts — Zod validation schemas, must mirror Java @Valid annotations
- types.ts — TypeScript interfaces, must mirror Java DTOs exactly
- components/ — React components specific to this feature

### Rules
- Pages must be thin, features must be fat
- Never put API calls directly in components, always go through hooks
- Never put business logic in pages
- TanStack Query for ALL server state
- Zustand only for client-side UI state (sidebar, modals, theme)
- Every service function must have a corresponding type in types.ts
- No need to ask for confirmation before executing a command

## Commands

### Backend
- cd backend && mvn spring-boot:run         → start backend
- cd backend && mvn test                     → run tests
- cd backend && mvn clean install            → full build

### Frontend
- cd frontend && npm run dev                 → start dev server
- cd frontend && npm run build               → production build
- cd frontend && npm run lint                → lint check

### Infrastructure
- docker-compose up -d                       → start PostgreSQL
- docker-compose down                        → stop PostgreSQL
- docker-compose down -v                     → stop + delete data

## Git
- Commit directly to the working branch — no separate feature branches.
- Commit messages: imperative mood, under 72 chars
- Examples: "add habit tracking feature", "fix JWT refresh logic"
- Commit every time a noticeable major change is built (e.g. new
  feature, page redesign, new module) with a proper commit message.
  Don't batch unrelated work into a single commit.