# CIVIQ

Municipal operations platform (waste, recycling, zones, bins, alerts, routing, analytics, field workflows).

## Tech stack (strict)

| Layer | Technology |
|-------|------------|
| **Frontend** | **React** (Next.js 16, App Router, TypeScript, Tailwind CSS) |
| **Backend** | **Go** (Gin, JWT, `mongo` driver) |
| **Database** | **MongoDB** only (NoSQL — no PostgreSQL/SQL) |

Optional: the `ai-services/` folder is a legacy Python microservice for extra ML-style endpoints; the core product is **React + Go + MongoDB**.

## Prerequisites

- **Node.js** 20+
- **Go** 1.22+
- **MongoDB** 6+ running locally (`mongodb://127.0.0.1:27017`) or a hosted MongoDB URI

## How the pieces connect

```
Browser  →  Next.js (port 3000)  →  /api/* catch-all proxy  →  Go API (port 5000)  →  MongoDB
```

1. **MongoDB** must be running (`mongod` or Atlas URI in `MONGODB_URI`).
2. **Go API** reads `backend/.env`, serves `/api/*`, and uses the MongoDB driver (no SQL).
3. **Next.js** serves the React app. Client code calls **`/api/...`** (same origin). The route `frontend/src/app/api/[...path]/route.ts` **proxies** to the Go server (`API_PROXY_TARGET` or `http://127.0.0.1:5000/api` by default), so the browser does not need CORS to the Go port for normal dashboard calls.
4. **WebSocket** is off by default (`NEXT_PUBLIC_ENABLE_WEBSOCKET=false`) because the Go stack does not ship Socket.IO; enable when you add a realtime server.

## Configuration

### Backend (`backend/.env`)

Copy `backend/.env.example` → `backend/.env`. Important keys:

- `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017`
- `MONGODB_DATABASE` — e.g. `civiq`
- `JWT_SECRET` — long random string (32+ characters)
- `CORS_ORIGIN` — e.g. `http://localhost:3000`

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
```

Set `NEXT_PUBLIC_AI_API_URL` only if you run the optional Python AI service. Realtime Socket.IO on the Go server is optional (`SOCKETIO_ENABLED`); the UI defaults `NEXT_PUBLIC_SOCKET_URL` for compatibility.

## Run fullstack (recommended)

From the **repository root**:

```bash
npm install
npm run dev
```

This starts the **Next.js** dev server and the **Go** API together (via `concurrently`).

Or run in two terminals:

```bash
# Terminal 1 — MongoDB must already be running
cd backend
go run ./cmd/server
```

```bash
# Terminal 2
cd frontend
npm install
npm run dev
```

- **App:** [http://localhost:3000](http://localhost:3000)
- **API:** [http://localhost:5000/api](http://localhost:5000/api) — e.g. `GET /api/health`

Seeded demo users (after first successful DB connection) use passwords from `SEED_ADMIN_PASSWORD` (default `civiq2026`), e.g. `admin@civiq.city`.

## Commands

| Location | Command | Purpose |
|----------|---------|---------|
| repo root | `npm run dev` | Next.js + Go (fullstack) |
| `backend/` | `go run ./cmd/server` | API only |
| `backend/` | `go build -o civiq-api ./cmd/server` | Production binary |
| `frontend/` | `npm run dev` | Frontend only |

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). Use a **MongoDB** connection string (Atlas, etc.), not SQL.

## Legacy stacks

Older revisions used Express/Prisma/PostgreSQL or Spring Boot. The current backend is **Go + MongoDB** only.
