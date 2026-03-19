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
app.use('/api/auth', authRoutes);
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

  const defaultEmail = process.env.SEED_ADMIN_EMAIL || 'admin@civiq.city';
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || 'civiq2026';
  const orgName = process.env.SEED_ORGANIZATION_NAME || 'CIVIQ Demo City';

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
  await prisma.user.upsert({
    where: { email: defaultEmail },
    update: {
      passwordHash,
      name: 'CIVIQ Administrator',
      role: 'SUPER_ADMIN',
      organizationId: org.id,
    },
    create: {
      email: defaultEmail,
      passwordHash,
      name: 'CIVIQ Administrator',
      role: 'SUPER_ADMIN',
      organizationId: org.id,
    },
  });
}

async function startServer() {
  await ensureDefaultLoginUser();
  server = app.listen(config.port, () => {
    console.log(`CIVIQ Backend listening on http://localhost:${config.port}`);
  });
}

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
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
