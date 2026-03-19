import { Router } from 'express';
import { aiService } from '../services/aiService.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

// Protect all AI routes
router.use(authenticateToken);

router.get('/forecast/:zoneId', async (req: AuthRequest, res, next) => {
  try {
    const zoneId = String(req.params.zoneId);
    if (!zoneId) {
      return next(new HttpError(400, 'Zone ID is required.'));
    }
    const forecast = await aiService.getWasteForecast(zoneId, req.user!.organizationId);
    res.json(forecast);
  } catch (error) {
    next(error);
  }
});

router.post('/optimize-routes', async (req: AuthRequest, res, next) => {
  try {
    const { vehicleIds } = req.body;
    if (vehicleIds && !Array.isArray(vehicleIds)) {
      return next(new HttpError(400, 'vehicleIds must be an array.'));
    }
    const routes = await aiService.optimizeRoutes(vehicleIds || [], req.user!.organizationId);
    res.json(routes);
  } catch (error) {
    next(error);
  }
});

router.get('/risk/:zoneId', async (req: AuthRequest, res, next) => {
  try {
    const zoneId = String(req.params.zoneId);
    if (!zoneId) {
      return next(new HttpError(400, 'Zone ID is required.'));
    }
    const assessment = await aiService.getRiskAssessment(zoneId, req.user!.organizationId);
    res.json(assessment);
  } catch (error) {
    next(error);
  }
});

export default router;
