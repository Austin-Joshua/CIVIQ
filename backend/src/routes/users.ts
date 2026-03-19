import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { authenticateToken, AuthRequest, authorizeRoles, ROLES } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

router.use(authenticateToken);

// Only SUPER_ADMIN and GOV_ADMIN can manage users
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.GOV_ADMIN));

// Get all users in the organization
router.get('/', auditLog('VIEW_USERS', 'User'), async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user?.organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Invite / Create user
router.post('/invite', auditLog('INVITE_USER', 'User'), async (req: AuthRequest, res, next) => {
  try {
    const { email, name, role, temporaryPassword } = req.body;

    if (!email || !name || !role) {
      throw new HttpError(400, 'Email, name, and role are required.');
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      throw new HttpError(409, 'User with this email already exists.');
    }

    // Default password if not provided (e.g., waiting for invite link resolution in a real system)
    const rawPass = temporaryPassword || 'Welcome123!';
    const passwordHash = await bcrypt.hash(rawPass, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash,
        organizationId: req.user!.organizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// Update user role/info
router.patch('/:id', auditLog('UPDATE_USER', 'User'), async (req: AuthRequest, res, next) => {
  try {
    const userId = String(req.params.id);
    const { name, role } = req.body;

    // Prevent modifying a user outside the organization (already handled by Prisma Row Level tenantContext if strictly enforced natively, but we ensure it here as standard)
    const targetUser = await prisma.user.findFirst({
      where: { id: userId, organizationId: req.user?.organizationId }
    });

    if (!targetUser) {
      throw new HttpError(404, 'User not found or access denied.');
    }

    // Prevent removing the last admin (basic safety check)
    if (role && targetUser.role === ROLES.GOV_ADMIN && role !== ROLES.GOV_ADMIN) {
      const adminCount = await prisma.user.count({
        where: { organizationId: req.user!.organizationId, role: ROLES.GOV_ADMIN }
      });
      if (adminCount <= 1) {
        throw new HttpError(400, 'Cannot demote the last Government Administrator.');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Deactivate / Delete user
router.delete('/:id', auditLog('DELETE_USER', 'User'), async (req: AuthRequest, res, next) => {
  try {
    const userId = String(req.params.id);

    if (userId === req.user?.id) {
      throw new HttpError(400, 'You cannot delete your own account. Ask another administrator.');
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: userId, organizationId: req.user?.organizationId }
    });

    if (!targetUser) {
      throw new HttpError(404, 'User not found or access denied.');
    }

    if (targetUser.role === ROLES.GOV_ADMIN) {
        const adminCount = await prisma.user.count({
          where: { organizationId: req.user!.organizationId, role: ROLES.GOV_ADMIN }
        });
        if (adminCount <= 1) {
          throw new HttpError(400, 'Cannot delete the last Government Administrator.');
        }
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
