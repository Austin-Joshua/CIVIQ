import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, AuthRequest, authorizeRoles, ROLES } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

router.use(authenticateToken);

// Get all bins (with optional zone filtering and mandatory organization filtering)
router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.GOV_ADMIN, ROLES.OPS_MANAGER, ROLES.ANALYST, ROLES.AUDITOR, ROLES.FIELD_SUPERVISOR, ROLES.VIEWER), auditLog('VIEW_BINS', 'Bin'), async (req: AuthRequest, res, next) => {
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
  } catch (error) {
    next(error);
  }
});

// Update bin fill level (simulating sensor data update)
router.patch('/:id/fill', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.GOV_ADMIN, ROLES.OPS_MANAGER, ROLES.FIELD_SUPERVISOR, ROLES.FIELD_OPERATOR), auditLog('UPDATE_BIN_FILL', 'Bin'), async (req: AuthRequest, res, next) => {
  try {
    const binId = String(req.params.id);
    const { fillLevel } = req.body;
    const numericFill = Number(fillLevel);
    if (!Number.isFinite(numericFill) || numericFill < 0 || numericFill > 100) {
      return next(new HttpError(400, 'Fill level must be a number between 0 and 100.'));
    }
    
    // First verify the bin belongs to a zone in the user's organization
    const existingBin = await prisma.bin.findUnique({
      where: { id: binId },
      include: { zone: true }
    });

    if (!existingBin || existingBin.zone.organizationId !== req.user?.organizationId) {
      return next(new HttpError(404, 'Bin not found.'));
    }

    const bin = await prisma.bin.update({
      where: { id: binId },
      data: { currentFillLevel: numericFill }
    });
    res.json(bin);
  } catch (error) {
    next(error);
  }
});

export default router;
