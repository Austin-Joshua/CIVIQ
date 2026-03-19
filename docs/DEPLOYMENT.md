# CIVIQ Deployment Runbook

## Services
- `frontend` (Next.js)
- `backend` (Express + Prisma)
- `ai-services` (Python API)

## Target Hosting
- Frontend: **Vercel**
- Backend API: **Render**
- AI service (optional): **Render**

## Required Environment Variables

### Frontend
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_AI_API_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional)
- `NEXT_PUBLIC_GOOGLE_MAP_ID` (optional)

### Backend
- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `DATABASE_URL`

### AI Services
- `PORT`

## Vercel Frontend Setup
1. Import the `frontend` directory as the project root.
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com/api`
   - `NEXT_PUBLIC_AI_API_URL=https://<your-ai-service>.onrender.com`
   - Google Maps variables if used.
3. Build command: `npm run build`
4. Output: Next.js default

## Render Backend Setup
1. Use the root `render.yaml` blueprint **or** create a web service with root `backend`.
2. Build command: `npm ci && npm run build`
3. Start command: `npm run start`
4. Required env:
   - `JWT_SECRET` (strong random)
   - `DATABASE_URL` (managed Postgres)
   - `CORS_ORIGIN=https://<your-frontend>.vercel.app`
5. Health check path: `/api/health`

## Render AI Service Setup (optional)
1. Create a Python web service with root `ai-services`.
2. Install command: `pip install -r requirements.txt`
3. Start command: use your server entrypoint in `main.py`.
4. Set `PORT` from Render environment.

## Startup Order
1. Start `backend`
2. Start `ai-services`
3. Start `frontend`

## Health Checks
- Backend liveness: `GET /api/health`
- Backend readiness: `GET /api/ready`

## Pre-Deployment Checklist
- `frontend`: `npm run build`
- `backend`: `npm run build`
- `ai-services`: `python -m py_compile main.py`
- Verify env files are set from `.env.example` templates
- Verify `JWT_SECRET` is set and not default/empty
- Verify CORS allowlist matches deployed frontend origin

## Runtime Verification
- Log in and validate dashboard access control
- Open map and key dashboard modules
- Validate file exports in analytics/compliance/activity/settings
- Verify backend responds with `x-request-id` headers
- Verify browser requests use Render host URLs from Vercel frontend

