import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import fs from 'fs';
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

// 生产模式：提供前端静态文件（server/public）
const publicDir = path.join(__dirname, '..', 'public');
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');

const frontendPath = fs.existsSync(publicDir) ? publicDir
  : fs.existsSync(clientDist) ? clientDist
  : null;

// 微信验证文件目录 (放 .txt 验证文件)
const verifyDir = path.join(__dirname, '..', 'verify');
if (fs.existsSync(verifyDir)) {
  app.use(express.static(verifyDir, { maxAge: '1d' }));
}

if (frontendPath) {
  app.use(express.static(frontendPath, { maxAge: '1h' }));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  console.log(`Frontend: ${frontendPath}`);
} else {
  console.log('API-only mode (no frontend dist)');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
