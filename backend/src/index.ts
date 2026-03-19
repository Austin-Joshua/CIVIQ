import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
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

const server = app.listen(config.port, () => {
  console.log(`CIVIQ Backend listening on http://localhost:${config.port}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});
