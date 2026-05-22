import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import restaurantRoutes from './routes/restaurants';
import locationRoutes from './routes/location';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(compression());
app.use(cors());

// API 路由
app.use('/api/location', locationRoutes);
app.use('/api/restaurants', restaurantRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 生产模式：提供前端静态文件
const frontendDist = path.join(__dirname, '..', '..', 'client', 'dist');
try {
  app.use(express.static(frontendDist, { maxAge: '1h' }));
  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  console.log(`Serving frontend from ${frontendDist}`);
} catch {
  console.log('Frontend dist not found, running API-only mode');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
