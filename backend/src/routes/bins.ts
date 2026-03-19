import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Get all bins (with optional zone filtering and mandatory organization filtering)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { zoneId } = req.query;
    const bins = await prisma.bin.findMany({
      where: {
        zone: {
          organizationId: req.user?.organizationId
        },
        ...(zoneId ? { zoneId: String(zoneId) } : {})
      },
      include: { zone: { select: { name: true } } }
    });
    res.json(bins);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update bin fill level (simulating sensor data update)
router.patch('/:id/fill', async (req: AuthRequest, res) => {
  try {
    const { fillLevel } = req.body;
    
    // First verify the bin belongs to a zone in the user's organization
    const existingBin = await prisma.bin.findUnique({
      where: { id: req.params.id },
      include: { zone: true }
    });

    if (!existingBin || existingBin.zone.organizationId !== req.user?.organizationId) {
       return res.status(404).json({ message: 'Bin not found' });
    }

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
