import { Router } from 'express';
import { suggestLocations } from '../services/amapService';

const router = Router();

router.get('/suggest', async (req, res) => {
  const { q } = req.query;
  if (!q || String(q).trim().length === 0) {
    res.json({ suggestions: [] });
    return;
  }

  const suggestions = await suggestLocations(String(q).trim());
  res.json({ suggestions });
});

export default router;
