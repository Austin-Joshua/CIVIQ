# CIVIQ Frontend

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAP_ID=
```

## Production Deployment (Vercel + Render)

- Deploy this `frontend` folder on Vercel.
- Deploy backend API on Render.
- In Vercel project settings, set:
  - `NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com/api`
  - `NEXT_PUBLIC_AI_API_URL=https://<your-ai-service>.onrender.com` (if used)
  - map keys if required

## Build

```bash
npm run build
```

For full platform deployment instructions, see `../docs/DEPLOYMENT.md`.
