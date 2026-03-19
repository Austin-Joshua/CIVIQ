import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, AuthRequest, authorizeRoles, ROLES } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = Router();

router.use(authenticateToken);

// Get all zones with their cleanliness summary
// Get all zones with their cleanliness summary (Accessible by Ops Managers and above, or Auditors)
router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.GOV_ADMIN, ROLES.OPS_MANAGER, ROLES.ANALYST, ROLES.AUDITOR, ROLES.VIEWER), auditLog('VIEW_ZONES', 'Zone'), async (req: AuthRequest, res) => {
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get zone by ID with bins
// Get zone by ID with bins
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.GOV_ADMIN, ROLES.OPS_MANAGER, ROLES.ANALYST, ROLES.AUDITOR, ROLES.VIEWER), auditLog('VIEW_ZONE_DETAIL', 'Zone'), async (req: AuthRequest, res) => {
  try {
    const zone = await prisma.zone.findUnique({
      where: { 
        id: req.params.id,
        organizationId: req.user?.organizationId 
      },
      include: { bins: true }
    });
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json(zone);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
