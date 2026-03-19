import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role, organizationName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // For SaaS, usually they either join an org or create one.
    // If organizationName is provided, create a new one, else create a default 'CIVIQ Demo' org.
    let orgName = organizationName || `${name}'s Organization`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'OPS_MANAGER',
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
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, organizationId: user.organizationId }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
