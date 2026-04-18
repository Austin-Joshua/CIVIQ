# CIVIQ Frontend

React (Next.js 16) UI for the CIVIQ platform. The API is implemented in **Go** and uses **MongoDB** — see the repository root `README.md`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Start the Go API separately (or use `npm run dev` from the **repository root** to run frontend + API together).

## Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAP_ID=
```

## Production Deployment (Vercel + API host)

- Deploy this `frontend` folder on Vercel.
- Deploy the Go backend (e.g. Render) with MongoDB.
- In Vercel project settings, set:
  - `NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com/api`
  - `NEXT_PUBLIC_SOCKET_URL` only if you expose Socket.IO
  - `NEXT_PUBLIC_AI_API_URL` if you use the optional Python service
  - Map keys if required

## Build

```bash
npm run build
```

For full deployment instructions, see [`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md).
