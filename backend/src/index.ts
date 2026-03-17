import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import zoneRoutes from './routes/zones.js';
import binRoutes from './routes/bins.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/bins', binRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CIVIQ API is running' });
});

app.listen(PORT, () => {
  console.log(`CIVIQ Backend listening on http://localhost:${PORT}`);
});
