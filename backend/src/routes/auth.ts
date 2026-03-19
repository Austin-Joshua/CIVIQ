import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { config } from '../lib/config.js';
import { HttpError } from '../middleware/error.js';

const router = express.Router();
const JWT_SECRET = config.jwtSecret;
const ALLOWED_SIGNUP_ROLES = new Set(['OPS_MANAGER', 'ANALYST', 'VIEWER']);

function ensureValidEmail(email: unknown) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Please provide a valid email address.');
  }
}

function ensureValidPassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters long.');
  }
}

function ensureValidName(name: unknown) {
  if (typeof name !== 'string' || name.trim().length < 2) {
    throw new HttpError(400, 'Please provide your full name.');
  }
}

// Signup
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name, role, organizationName } = req.body;
    ensureValidEmail(email);
    ensureValidPassword(password);
    ensureValidName(name);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpError(409, 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const safeRole = ALLOWED_SIGNUP_ROLES.has(role) ? role : 'OPS_MANAGER';
    const orgName =
      typeof organizationName === 'string' && organizationName.trim().length > 2
        ? organizationName.trim()
        : `${name.trim()}'s Organization`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name.trim(),
        role: safeRole,
        organization: {
          create: {
            name: orgName,
            subscriptionPlan: 'FREE'
          }
        }
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role, organizationId: user.organizationId }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    ensureValidEmail(email);
    ensureValidPassword(password);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    const token = jwt.sign({ id: user.id, role: user.role, organizationId: user.organizationId }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId },
    });
  } catch (error) {
    next(error);
  }
});

// Guest login (free access)
router.post('/guest-login', async (_req, res, next) => {
  try {
    const user =
      (await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
        orderBy: { id: 'asc' },
      })) ||
      (await prisma.user.findFirst({
        orderBy: { id: 'asc' },
      }));

    if (!user) {
      throw new HttpError(503, 'No user is available yet. Please try again shortly.');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
