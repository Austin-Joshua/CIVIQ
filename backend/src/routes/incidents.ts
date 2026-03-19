import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, AuthRequest, authorizeRoles, ROLES } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { broadcastToTenant } from '../modules/realtime/websocket.gateway.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

router.use(authenticateToken);

// Get all incidents/alerts in the organization
router.get('/', auditLog('VIEW_INCIDENTS', 'Alert'), async (req: AuthRequest, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { organizationId: req.user?.organizationId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

// Create new incident manually (e.g. reported by field worker)
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.GOV_ADMIN, ROLES.OPS_MANAGER, ROLES.FIELD_SUPERVISOR, ROLES.FIELD_OPERATOR), auditLog('CREATE_INCIDENT', 'Alert'), async (req: AuthRequest, res, next) => {
  try {
    const { type, severity, message } = req.body;
    
    if (!type || !severity || !message) {
      throw new HttpError(400, 'Missing required fields.');
    }

    const alert = await prisma.alert.create({
      data: {
        type,
        severity,
        message,
        status: 'DETECTED',
        organizationId: req.user!.organizationId,
      },
      include: { assignedTo: { select: { name: true } } }
    });

    broadcastToTenant(req.user!.organizationId, 'incident_created', alert);
    
    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
});

// Update incident status/assignment
router.patch('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.GOV_ADMIN, ROLES.OPS_MANAGER, ROLES.FIELD_SUPERVISOR, ROLES.FIELD_OPERATOR), auditLog('UPDATE_INCIDENT', 'Alert'), async (req: AuthRequest, res, next) => {
  try {
    const { status, assignedToId, resolutionNotes } = req.body;
    const incidentId = String(req.params.id);

    // Verify alert exists
    const existingAlert = await prisma.alert.findFirst({
      where: { id: incidentId, organizationId: req.user?.organizationId }
    });

    if (!existingAlert) {
      throw new HttpError(404, 'Incident not found.');
    }

    // A field worker shouldn't reassign incidents unless to themselves, but we'll enforce basic trust inside an organization for now.
    // Realistically you might enforce stricter assignment constraints here.

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;
    
    if (status === 'RESOLVED') {
      updateData.resolved = true;
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: incidentId },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } }
      }
    });

    broadcastToTenant(req.user!.organizationId, 'incident_updated', updatedAlert);

    res.json(updatedAlert);
  } catch (error) {
    next(error);
  }
});

export default router;
