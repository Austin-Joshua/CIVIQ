import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, AuthRequest, authorizeRoles, ROLES } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

router.use(authenticateToken);

// Get all zones with their cleanliness summary (Accessible by Ops Managers and above, or Auditors)
router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.GOV_ADMIN, ROLES.OPS_MANAGER, ROLES.ANALYST, ROLES.AUDITOR, ROLES.VIEWER), auditLog('VIEW_ZONES', 'Zone'), async (req: AuthRequest, res, next) => {
  try {
    const zones = await prisma.zone.findMany({
      where: { organizationId: req.user?.organizationId },
      include: {
        _count: {
          select: { bins: true }
        }
      }
    });
    res.json(zones);
  } catch (error) {
    next(error);
  }
});

// Get zone by ID with bins
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.GOV_ADMIN, ROLES.OPS_MANAGER, ROLES.ANALYST, ROLES.AUDITOR, ROLES.VIEWER), auditLog('VIEW_ZONE_DETAIL', 'Zone'), async (req: AuthRequest, res, next) => {
  try {
    const zoneId = String(req.params.id);
    const zone = await prisma.zone.findFirst({
      where: { 
        id: zoneId,
        organizationId: req.user?.organizationId 
      },
      include: { bins: true }
    });
    if (!zone) return next(new HttpError(404, 'Zone not found.'));
    res.json(zone);
  } catch (error) {
    next(error);
  }
});

export default router;
