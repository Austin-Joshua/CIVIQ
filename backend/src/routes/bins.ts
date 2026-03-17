import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Get all bins (with optional zone filtering)
router.get('/', async (req, res) => {
  try {
    const { zoneId } = req.query;
    const bins = await prisma.bin.findMany({
      where: zoneId ? { zoneId: String(zoneId) } : {},
      include: { zone: { select: { name: true } } }
    });
    res.json(bins);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update bin fill level (simulating sensor data update)
router.patch('/:id/fill', async (req, res) => {
  try {
    const { fillLevel } = req.body;
    const bin = await prisma.bin.update({
      where: { id: req.params.id },
      data: { currentFillLevel: fillLevel }
    });
    res.json(bin);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
