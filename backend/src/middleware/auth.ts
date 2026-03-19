import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';
import { HttpError } from './error.js';

const JWT_SECRET = config.jwtSecret;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    organizationId: string;
  };
}

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  GOV_ADMIN: 'GOV_ADMIN',
  OPS_MANAGER: 'OPS_MANAGER',
  ANALYST: 'ANALYST',
  FIELD_SUPERVISOR: 'FIELD_SUPERVISOR',
  FIELD_OPERATOR: 'FIELD_OPERATOR',
  AUDITOR: 'AUDITOR',
  VIEWER: 'VIEWER'
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new HttpError(401, 'Authentication token required'));
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return next(new HttpError(403, 'Invalid or expired token'));
    }
    req.user = user;
    
    // Explicit tenant override header for super admins (if required)
    let tenantId = user.organizationId;
    if (user.role === ROLES.SUPER_ADMIN && req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id'] as string;
    }

    import('../lib/tenantContext.js').then(({ tenantContext }) => {
      tenantContext.run(tenantId, () => {
        next();
      });
    }).catch(next);
  });
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Insufficient permissions'));
    }
    next();
  };
};
