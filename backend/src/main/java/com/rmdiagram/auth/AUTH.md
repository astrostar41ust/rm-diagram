# Auth Module

JWT access tokens + opaque, hashed refresh tokens with rotation. Lives in
`com.rmdiagram.auth` and follows the project's package-by-feature rule.

## Files at a glance

| File | Role |
|------|------|
| `AuthController.java` | HTTP entry points under `/api/v1/auth` |
| `AuthService.java` | Register / login / refresh business logic |
| `AuthDto.java` | Request and response payloads (records) |
| `JwtService.java` | Signs, parses, and validates **access** JWTs |
| `JwtAuthenticationFilter.java` | Reads `Authorization` header on every protected request |
| `RefreshToken.java` | JPA entity persisting issued refresh tokens (hashed) |
| `RefreshTokenRepository.java` | Spring Data repo for `RefreshToken` |

## Token model — at a glance

| Concern | Access token | Refresh token |
|---|---|---|
| Format | JWT (HS256) | Opaque random, base64url, 32 bytes |
| Lifetime | minutes (`app.jwt.expiration-ms`) | days (`app.jwt.refresh-expiration-ms`) |
| Validation | stateless: signature + expiry | DB lookup of SHA-256 hash + `revoked` + `expiresAt` |
| Stored in DB? | no | yes — **only the SHA-256 hash** |
| Source of truth | the JWT itself | the `refresh_tokens` row |

Why opaque + hashed for refresh? It's the single source of truth, so
there is no second crypto check to keep in sync; if the database is ever
read, hashes alone aren't usable as tokens. Access tokens stay JWT for
fast, stateless per-request validation — no DB hit on the hot path.

## Request flow

```
Client ──POST /api/v1/auth/{register|login|refresh}──▶ AuthController
                                                        │
                                                        ▼
                                                   AuthService
                                          ┌─────────────┼─────────────┐
                                          ▼             ▼             ▼
                                  UserRepository  PasswordEncoder  JwtService (access only)
                                                                       │
                                                                       ▼
                                                           RefreshTokenRepository

Subsequent authenticated calls
Client ──Authorization: Bearer <access-jwt>──▶ JwtAuthenticationFilter
                                                  │
                                                  ▼
                                         SecurityContextHolder (per-request)
```

## `AuthController`

Thin REST layer. Three `POST` endpoints, all return `AuthResponse`:

- `POST /api/v1/auth/register` → `201 Created`
- `POST /api/v1/auth/login` → `200 OK`
- `POST /api/v1/auth/refresh` → `200 OK`

`@Valid` runs Bean Validation before the service is invoked. Responses
use `ResponseEntity` with explicit status codes.

## `AuthDto`

Sealed utility class with four records:

- `LoginRequest(email, password)` — both `@NotBlank`, email validated.
- `RegisterRequest(email, password, username, firstname, lastname)` —
  `@Size` constraints (password 8–100, username 3–50, names ≤100).
- `RefreshTokenRequest(refreshToken)` — single non-blank field.
- `AuthResponse(accessToken, refreshToken, tokenType, expiresIn, user)` —
  `tokenType` is `"Bearer"`, `expiresIn` is access token TTL in seconds,
  `user` is `UserDto.UserResponse` so the entity is never leaked.

## `AuthService`

`@Service @RequiredArgsConstructor @Slf4j`. All public methods are
`@Transactional`.

### `register(RegisterRequest)`
1. Reject if email or username already exist (`ConflictException`, 409).
2. Encode password with `PasswordEncoder` (BCrypt).
3. Persist `User` with `Role.USER`.
4. `issueTokens(user)`.

### `login(LoginRequest)`
1. `AuthenticationManager.authenticate(...)` — uses
   `CustomUserDetailsService` + BCrypt; throws on bad credentials.
2. Reload the `User` (the manager only proves auth succeeded).
3. `issueTokens(user)`.

### `refresh(RefreshTokenRequest)`
1. SHA-256 the presented token, look up by `token_hash`.
2. Reject if missing or `!isActive()` (revoked or past `expiresAt`)
   → `UnauthorizedException` (401).
3. **Rotate**: mark the row revoked (managed entity, flushed at commit),
   then `issueTokens(user)`.

A replayed (already-revoked) refresh token is rejected — useful for
detecting token theft.

### `issueTokens(User)` (private)
- Generate access JWT via `JwtService`.
- Generate a 32-byte random opaque refresh token (base64url).
- Persist a `RefreshToken` row with the **SHA-256 hash** and absolute
  `expiresAt`.
- Return `AuthResponse` containing the *plaintext* refresh token (sent
  to the client; never stored server-side in plaintext).

## `JwtService`

Owns access-token crypto only. Built from two properties:

- `app.jwt.secret` — HMAC key (UTF-8 bytes via `Keys.hmacShaKeyFor`).
- `app.jwt.expiration-ms` — access token lifetime.

### Public API
- `generateAccessToken(UserDetails)`
- `getAccessTokenExpirationMs()`
- `extractUsername(token)` — pulls the `sub` claim.
- `isTokenValid(token, userDetails)` — subject matches AND not expired,
  in a single parse.

The HMAC key must be ≥256 bits or `Keys.hmacShaKeyFor` throws on
startup.

## `JwtAuthenticationFilter`

Extends `OncePerRequestFilter`; wired into the security chain by
`SecurityConfig` before `UsernamePasswordAuthenticationFilter`.

- `shouldNotFilter` skips `/api/v1/auth/**` outright — those endpoints
  are public and don't need a security context.
- For everything else: read `Authorization`, strip `Bearer `, extract
  username; on success, load `UserDetails` and place a
  `UsernamePasswordAuthenticationToken` in the `SecurityContextHolder`.
- Any parse failure → DEBUG log and pass through. Denial is left to
  Spring's `ExceptionTranslationFilter` downstream.
- The principal placed in the context is the `User` entity itself
  (since `User implements UserDetails`). Controllers retrieve it via
  `@AuthenticationPrincipal User user`.

## `RefreshToken` (entity)

Maps to table `refresh_tokens`:

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGINT` PK | `IDENTITY` |
| `user_id` | FK → `users.id` | `ManyToOne(LAZY)`, not null |
| `token_hash` | `VARCHAR(64)` | unique, **SHA-256 hex of the token** |
| `expires_at` | `TIMESTAMP` | `Instant`, absolute expiry |
| `revoked` | `BOOLEAN` | defaults `false` |
| `created_at` | `TIMESTAMP` | set in `@PrePersist`, not updatable |

Helper: `isActive()` → `!revoked && Instant.now().isBefore(expiresAt)`.

## `RefreshTokenRepository`

- `findByTokenHash(String)` — used during `/refresh`.
- `revokeAllByUserId(Long)` — bulk update via `@Modifying` JPQL. Available
  for "logout everywhere" / password reset flows.

## Token lifecycle & security notes

- **Access token**: short-lived JWT, sent on every request as
  `Authorization: Bearer …`. Stateless — never stored server-side.
- **Refresh token**: opaque, hashed at rest. The plaintext value lives
  only on the client; the server only ever sees its hash.
- **Rotation**: every successful `/refresh` revokes the presented token
  and issues a brand-new pair. Replay of a revoked token → 401.
- **DB compromise resistance**: leaking `refresh_tokens` rows does not
  yield usable tokens, since SHA-256 is one-way and the input space
  (256-bit random) makes brute force infeasible.
- **Password storage**: BCrypt via the framework-provided
  `PasswordEncoder` bean (configured in `SecurityConfig`).
- **Errors**: `ConflictException` (409) for duplicate email/username,
  `UnauthorizedException` (401) for any auth failure. Routed through
  `GlobalExceptionHandler` per project convention.

## Required configuration

```yaml
app:
  jwt:
    secret: <random string, ≥256 bits for HS256>
    expiration-ms: 900000          # 15 minutes
    refresh-expiration-ms: 604800000 # 7 days
```

## External collaborators

- `com.rmdiagram.user.{User, UserRepository, UserDto}` — identity store.
  `User` implements `UserDetails`, so it doubles as the security
  principal.
- `com.rmdiagram.user.CustomUserDetailsService` — `loadUserByUsername`
  resolves by email.
- `com.rmdiagram.config.SecurityConfig` — registers the filter, exposes
  `AuthenticationManager` + `PasswordEncoder` beans, declares public
  routes (`/api/v1/auth/**`) vs. authenticated.
- `com.rmdiagram.exception.{ConflictException, UnauthorizedException,
  GlobalExceptionHandler}` — error translation to the standard
  `{ code, message }` response body.
