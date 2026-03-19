import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from './auth';

/**
 * Middleware to log actions to the AuditLog table.
 * Ensure this is placed AFTER the authenticateToken middleware.
 * 
 * @param action Description of the action (e.g. "UPDATE_ZONE", "DELETE_USER")
 * @param entityType The entity being modified (e.g. "Zone", "User")
 */
export const auditLog = (action: string, entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Intercept the response to log after it finishes or we can log immediately before next()
    // For an audit trail, usually we log the intent or the outcome. We'll log the intent here,
    // or capture original res.send to log outcome. For simplicity, we log upon request.
    
    // We only log if user is authenticated and we have details
    if (req.user) {
      const { id: userId, organizationId } = req.user;
      
      const metadata = {
        method: req.method,
        url: req.originalUrl,
        body: req.method !== 'GET' ? req.body : undefined,
        query: req.query,
        ip: req.ip
      };

      try {
        await prisma.auditLog.create({
          data: {
            action,
            entityType,
            entityId: req.params.id || null, // Best effort to extract entityId from URL params
            metadata: JSON.stringify(metadata),
            userId,
            organizationId
          }
        });
      } catch (error) {
        console.error("Failed to write to audit log:", error);
        // Do not block the request if auditing fails in this setup
      }
    }
    
    next();
  };
};
