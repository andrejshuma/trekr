# AGENTS.md — Agent onboarding for Trekr

Checklist for an AI coding agent when working in this repo
- [ ] Understand architecture: `frontend` (Vite + React) talking to `backend` (Spring Boot REST API).
- [ ] Know how to run & iterate locally (frontend dev server + backend JVM with env vars/.env).
- [ ] Token & auth contract: JWT format, Authorization: Bearer header, token stored by frontend at `localStorage:authToken`.
- [ ] Data & DB locations: `db-scripts/` (migrations, triggers, views) and JPA entities under `backend/src/main/java/com/trekr/backend/entity`.

Quick summary (one-liner)
Trekr is a split repo: a Vite React frontend (calls `/api/*`) and a Spring Boot backend (Java 17, Spring Data JPA, Spring Security with JWT). Backend loads a `.env`/`env` file before boot and expects DB and JWT secrets via environment properties.

Essential files & places to read first
- `backend/src/main/java/com/trekr/backend/BackendApplication.java` — .env loader behavior and how system properties are set.
- `backend/src/main/resources/application.properties` — key runtime properties (datasource, `jwt.secret`, JPA settings).
- `backend/src/main/java/com/trekr/backend/config/SecurityConfig.java` — top-level security rules and CORS dev origins (`http://localhost:5173`).
- `backend/src/main/java/com/trekr/backend/service/JwtService.java` — exact JWT payload (subject = userId, claims: `username`, `email`) and token validity.
- `backend/src/main/java/com/trekr/backend/security/JwtAuthenticationFilter.java` — how the backend extracts and validates the Bearer token.
- `backend/src/main/java/com/trekr/backend/config/LegacyPasswordEncoder.java` — password rules: supports BCrypt (new) and plaintext (legacy seeds).
- `backend/src/main/java/com/trekr/backend/controller/*` and `.../service/*` — canonical pattern: controllers are thin HTTP layers delegating to services; DTOs under `dto/`.
- `frontend/src/api/axios.js` and `frontend/src/utils/authSession.js` — axios interceptors, where tokens are read/written, dev API base (`import.meta.env.VITE_API_BASE_URL`).
- `db-scripts/` — migrations (`migrations/`), triggers and views—use these as source of truth for DB shape/constraints.

Run / build / dev commands
- Backend (preferred for local dev):
  - Start with a .env or `env` file in repo root or `backend/` (see `BackendApplication` search order). Example env keys used: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`.
  - Dev run (from repo root):

    cd backend && ./mvnw spring-boot:run

  - Package and run jar:

    cd backend && ./mvnw package
    java -jar target/backend-0.0.1-SNAPSHOT.jar

  - Run tests / compile:

    cd backend && ./mvnw test

- Frontend (Vite + npm):

  cd frontend && npm install
  npm run dev           # runs at :5173 by default (frontend dev)
  npm run build         # production bundle

Key runtime contracts & examples
- API prefix: frontend uses `VITE_API_BASE_URL` default `http://localhost:8080/api` and axios attaches `Authorization: Bearer <token>` header (see `frontend/src/api/axios.js`).
- Login flow: POST `/api/auth/login` returns `AuthResponse` (see `backend/src/main/java/com/trekr/backend/dto/auth/AuthResponse.java` and `AuthController`).
- JWT payload (verify when issuing tokens): subject = userId, claims `username` and `email` (see `JwtService.generateToken`).
- Token storage: frontend keys: `authToken` and `authUser` in localStorage (see `authSession.js`).

Project-specific conventions & notable patterns
- Layering: `controller` -> `service` -> `repository` (Spring Data JPA). DTOs are collected in `dto/<domain>` and entities are in `entity/<domain>`.
- Legacy seed convenience: `LegacyPasswordEncoder` accepts plain-text seeded passwords (non-bcrypt). When changing auth/seed data be careful to preserve compatibility.
- .env handling: Backend intentionally loads `.env` or `env` from several locations before Spring starts and sets values as system properties (so Spring `${...}` placeholders resolve). Put development env variables in repo root `.env` or `backend/.env`.
- Database: the repo contains SQL migrations and helpers in `db-scripts/` (migrations, triggers, views). Treat these as authoritative when changing JPA mappings and ensure migrations remain in sync.
- CORS: dev origins are explicitly whitelisted in `SecurityConfig` for the Vite dev server. If adding a different frontend origin add it there.

Integration & dependency notes
- JDBC: production target is PostgreSQL (dependency present in `pom.xml`), but tests use H2 (test scope). The default `application.properties` disables automatic DDL by default — change `SPRING_JPA_HIBERNATE_DDL_AUTO` if you need schema auto-update.
- JWT implementation uses `io.jsonwebtoken` (jjwt); signing key comes from `jwt.secret` (env `JWT_SECRET` or `JWT_CONFIG_SECRET`). The code pads a dev fallback to 32+ chars if secret is missing.
- Dotenv: the backend sets system properties using `io.github.cdimascio.dotenv.Dotenv` before Spring starts — do not rely on Spring's property loading only for dev overrides that the app expects early.

Debugging tips for agents
- If a token-authenticated endpoint returns 401 in dev, check:
  1) the frontend `authToken` is present and not expired (`authSession.isTokenExpired`).
  2) backend logs (Spring Security DEBUG is enabled in `application.properties`).
  3) CORS origins if calling from the browser dev server.
- To reproduce DB-related bugs locally, prefer running Postgres (set `SPRING_DATASOURCE_URL`) or temporarily set `SPRING_JPA_HIBERNATE_DDL_AUTO=update` for quick iteration (but be cautious with managed DBs).

Where to look for more context
- `backend/HELP.md` — general pointers and links to Spring docs.
- `db-scripts/` — migration and trigger logic (useful for understanding computed columns and constraints).
- `frontend/src/pages/*` and `frontend/src/api/*` — real call sites showing which backend endpoints are used.

If you need to make changes
- Prefer small edits in the pattern used: update DTOs + services + controllers; update SQL migrations when the schema changes; update `frontend/src/api/axios.js` and `VITE_API_BASE_URL` if changing API paths.

Done: create this file at repo root as `AGENTS.md` to guide future agents.

