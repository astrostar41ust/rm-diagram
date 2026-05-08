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

### Structure
- Pages in src/app/ using App Router
- Shared components in src/components/shared/
- shadcn/ui components in src/components/ui/
- API hooks in src/hooks/
- Types in src/types/ (must mirror Java DTOs exactly)

### Conventions
- TypeScript strict mode, no `any` types
- TanStack Query for ALL server state (never useState for API data)
- React Hook Form + Zod for all forms
- Zod schemas must match Java validation annotations
- Use server components by default, "use client" only when needed
- Axios instance from src/lib/api.ts for all API calls

### Styling
- Tailwind only, no custom CSS files unless absolutely necessary
- shadcn/ui for all UI components
- Mobile-responsive by default

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
- Branch naming: feature/{name}, fix/{name}, chore/{name}
- Commit messages: imperative mood, under 72 chars
- Examples: "add habit tracking feature", "fix JWT refresh logic"