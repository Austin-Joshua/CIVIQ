import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Get all zones with their cleanliness summary
router.get('/', async (req, res) => {
  try {
    const zones = await prisma.zone.findMany({
      include: {
        _count: {
          select: { bins: true }
        }
      }
    });
    res.json(zones);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get zone by ID with bins
router.get('/:id', async (req, res) => {
  try {
    const zone = await prisma.zone.findUnique({
      where: { id: req.params.id },
      include: { bins: true }
    });
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json(zone);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
