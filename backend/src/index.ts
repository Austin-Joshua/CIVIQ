import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import zoneRoutes from './routes/zones.js';
import binRoutes from './routes/bins.js';
import prisma from './lib/prisma.js';
import { config } from './lib/config.js';
import { errorHandler } from './middleware/error.js';

const app = express();

const allowedOrigins = config.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const requestId = randomUUID();
  res.setHeader('x-request-id', requestId);
  const start = Date.now();

  res.on('finish', () => {
    const elapsedMs = Date.now() - start;
    console.log(
      JSON.stringify({
        level: 'info',
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        elapsedMs,
      })
    );
  });

  next();
});

// Routes
import usersRoutes from './routes/users.js';
import incidentRoutes from './routes/incidents.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/bins', binRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CIVIQ API is running',
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.get('/api/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not_ready' });
  }
});

app.use(errorHandler);

let server: ReturnType<typeof app.listen> | null = null;

async function ensureDefaultLoginUser() {
  if (process.env.BOOTSTRAP_LOGIN_USER === 'false') {
    return;
  }

  const orgName = process.env.SEED_ORGANIZATION_NAME || 'CIVIQ Demo City';
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || 'civiq2026';

  let org = await prisma.organization.findFirst({ where: { name: orgName } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: orgName,
        subscriptionPlan: 'ENTERPRISE',
      },
    });
  }

  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const seedUsers = [
    { email: 'admin@civiq.city',      name: 'CIVIQ Administrator',  role: 'SUPER_ADMIN' },
    { email: 'gov@civiq.city',        name: 'Sarah Chen',           role: 'GOV_ADMIN' },
    { email: 'ops@civiq.city',        name: 'Raj Patel',            role: 'OPS_MANAGER' },
    { email: 'analyst@civiq.city',    name: 'Maya Torres',          role: 'ANALYST' },
    { email: 'supervisor@civiq.city', name: 'David Kim',            role: 'FIELD_SUPERVISOR' },
    { email: 'operator@civiq.city',   name: 'Alex Johnson',         role: 'FIELD_OPERATOR' },
    { email: 'auditor@civiq.city',    name: 'Priya Sharma',         role: 'AUDITOR' },
    { email: 'viewer@civiq.city',     name: 'Jordan Lee',           role: 'VIEWER' },
  ];

  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, name: u.name, role: u.role, organizationId: org.id },
      create: { email: u.email, passwordHash, name: u.name, role: u.role, organizationId: org.id },
    });
  }

  console.log(`Seeded ${seedUsers.length} users for organization "${orgName}"`);
}

import { initWebSocketGateway } from './modules/realtime/websocket.gateway.js';
import { analyticsWorker } from './workers/analytics.worker.js';

async function startServer() {
  try {
    console.log('Initializing database connectivity...');
    await ensureDefaultLoginUser();
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('CRITICAL: Database initialization failed. Server starting in degraded mode.');
    console.error(error);
  }

  server = app.listen(config.port, () => {
    console.log(`CIVIQ Backend listening on http://localhost:${config.port}`);
  });
  
  if (server) {
    initWebSocketGateway(server);
  }
  analyticsWorker.start();
}

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  analyticsWorker.stop();
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    return;
  }
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

void startServer();
