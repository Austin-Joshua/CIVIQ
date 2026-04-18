# CIVIQ Deployment Runbook

## Architecture (Vercel + Go + MongoDB)

The browser only talks to **your Vercel domain** (`/api/...`). Next.js **server-side** proxies those requests to your Go API. You do **not** point `NEXT_PUBLIC_*` at the Go URL for normal API calls—the app uses same-origin `/api`.

```
Browser → https://<your-app>.vercel.app/api/* → Next.js Route Handler → https://<your-backend>/api/* → MongoDB
```

### What you deploy separately

| Piece | Typical host | Notes |
|--------|----------------|-------|
| **MongoDB** | [MongoDB Atlas](https://www.mongodb.com/atlas) (or self-hosted) | Connection string goes only in the **backend** env. |
| **Go API** | Railway, Fly.io, Render, Google Cloud Run, DigitalOcean, etc. | Any host that runs a Go binary and exposes HTTPS. |
| **Frontend** | **Vercel** (root = `frontend/` or monorepo with root directory set) | Must set **`API_PROXY_TARGET`** (see below). |

---

## 1. Database (MongoDB Atlas)

1. Create a **cluster** (M0 free tier is fine to start).
2. **Database Access**: create a user/password (save securely).
3. **Network Access**:
   - For managed backends with changing IPs, use **`0.0.0.0/0`** (rely on strong credentials + TLS), **or** your provider’s static egress if you have it.
4. **Connect** → Drivers → copy the **`mongodb+srv://...`** URI.
5. Set on the backend only:
   - `MONGODB_URI` = full URI (with user/password and `retryWrites=true` etc. as Atlas suggests)
   - `MONGODB_DATABASE` = e.g. `civiq`

If you are **replacing an old backend**, you usually **keep the same Atlas project**—only the app that connects changes. Delete the old host after the new backend is healthy.

---

## 2. Backend (Go) — any host

Build and run (same as locally):

- **Build:** `go build -o bin/server ./cmd/server` (from `backend/`)
- **Start:** `./bin/server` (or `bin/server` on Windows in production)
- **Port:** your host sets `PORT` (often `8080` or `5000`).

### Required environment variables

| Variable | Example / notes |
|----------|-------------------|
| `PORT` | Whatever the platform assigns (often injected automatically). |
| `JWT_SECRET` | Long random string; **never** commit. |
| `MONGODB_URI` | Atlas `mongodb+srv://...` |
| `MONGODB_DATABASE` | e.g. `civiq` |
| `CORS_ORIGIN` | Your **Vercel** origin(s). Comma-separated if you need preview + production: `https://myapp.vercel.app,https://myapp.com` |
| `SOCKETIO_ENABLED` | `false` on single-port hosts unless you run Socket.IO separately. |

### Health checks

- `GET /api/health` — liveness  
- `GET /api/ready` — checks MongoDB  

Point your host’s health check at `/api/health` (see `render.yaml` in the repo for an example).

### Public URL

After deploy, note the **HTTPS base** of the API, e.g. `https://civiq-api.railway.app`.  
The proxy code expects the **API path prefix** `/api` on that host (same as local). If your Go app serves routes under `/api`, the proxy target is:

`https://<your-backend-host>/api`

---

## 3. Vercel frontend — connect to the new backend

**Critical (server-side only):** set **`API_PROXY_TARGET`** to the full URL of your Go API **including `/api`**, for example:

```bash
API_PROXY_TARGET=https://civiq-api.railway.app/api
```

- Set this in **Vercel → Project → Settings → Environment Variables** for **Production** (and **Preview** if you use preview deployments with a stable backend URL).
- Mark it as sensitive if your UI allows it; it is not exposed to the browser.

**How it resolves:** `frontend/src/lib/api/baseUrl.ts` uses `API_PROXY_TARGET`, then `NEXT_PUBLIC_API_URL`, then `BACKEND_URL`. Prefer **`API_PROXY_TARGET`** in production so the public bundle does not need the raw backend URL.

**Browser API path:** Client code uses **`getApiBaseUrl()` → `/api`**. No change needed when you swap backend hosts—only Vercel env + redeploy.

### Other Vercel variables (optional)

- `NEXT_PUBLIC_AI_API_URL` — only if you use `ai-services`
- `NEXT_PUBLIC_ENABLE_WEBSOCKET` — keep `false` unless you run a compatible Socket.IO server
- `NEXT_PUBLIC_GOOGLE_MAPS_*` — if you use maps

### Vercel project settings

1. **Root Directory:** `frontend` (if the repo contains `backend/` + `frontend/`).
2. **Build command:** `npm run build`
3. **Install:** default (`npm install`)
4. Deploy; then open the site and log in—traffic should flow: Vercel → Go → Atlas.

---

## 4. Replacing an old backend (e.g. old Render service)

1. Deploy the **new** Go service with the same Atlas env vars and a new `JWT_SECRET` only if you intend to invalidate existing tokens (otherwise keep the same secret for seamless sessions—your choice).
2. Set **`CORS_ORIGIN`** on the new backend to your Vercel URL(s).
3. Set **`API_PROXY_TARGET`** on Vercel to the **new** backend URL + `/api`.
4. Redeploy Vercel (or wait for auto-deploy).
5. Verify `GET https://<new-backend>/api/health` and login in the app.
6. Delete the old backend service when satisfied.

---

## 5. Pre-deployment checklist

- [ ] Atlas: user created, network access appropriate, URI works from a machine with `mongosh` or a one-off test.
- [ ] Backend: `go build` succeeds; `/api/health` and `/api/ready` return 200 when DB is up.
- [ ] Backend: `CORS_ORIGIN` includes every frontend origin you use (production + previews if they call the API through the proxy—CORS mainly matters for direct browser→Go calls; proxy path is server-to-server).
- [ ] Vercel: `API_PROXY_TARGET` points to `https://<backend>/api`.
- [ ] `JWT_SECRET` is set and not the default from `backend/.env.example`.

---

## 6. Optional: `render.yaml`

The repo includes `render.yaml` as a **blueprint** for deploying the `backend/` folder. You can use it on Render or translate the same build/start commands to another platform.

---

## 7. Troubleshooting

| Symptom | Likely cause |
|--------|----------------|
| `503` from `/api/...` on Vercel | Next.js cannot reach `API_PROXY_TARGET` (wrong URL, backend down, cold start). |
| Login works locally but not on Vercel | `API_PROXY_TARGET` missing/wrong, or backend `CORS_ORIGIN` / MongoDB unreachable from new host. |
| Mongo errors on backend | Wrong `MONGODB_URI`, IP allowlist, or DB user permissions. |
