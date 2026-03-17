import { Router } from 'express';
import { aiService } from '../services/aiService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Protect all AI routes
router.use(authenticateToken);

router.get('/forecast/:zoneId', async (req, res) => {
  try {
    const forecast = await aiService.getWasteForecast(req.params.zoneId);
    res.json(forecast);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/optimize-routes', async (req, res) => {
  try {
    const { vehicleIds } = req.body;
    const routes = await aiService.optimizeRoutes(vehicleIds || []);
    res.json(routes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/risk/:zoneId', async (req, res) => {
  try {
    const assessment = await aiService.getRiskAssessment(req.params.zoneId);
    res.json(assessment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
