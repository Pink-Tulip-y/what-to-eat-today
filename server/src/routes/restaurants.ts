import { Router, Request, Response } from "express";
import { searchRestaurants } from "../services/restaurantService";

const router = Router();

// 搜索外卖
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { location, category, excludes } = req.query;

    if (!location || !category) {
      res.status(400).json({ error: "location 和 category 为必填参数" });
      return;
    }

    const excludeList = excludes
      ? String(excludes)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const result = await searchRestaurants({
      location: String(location),
      category: String(category),
      excludes: excludeList,
      lat: req.query.lat ? Number(req.query.lat) : undefined,
      lng: req.query.lng ? Number(req.query.lng) : undefined,
    });

    res.json(result);
  } catch (err: any) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "搜索服务暂时不可用，请稍后重试" });
  }
});

// 生成外卖平台搜索深链
router.get("/order-links", (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    res.status(400).json({ error: "Need restaurant name" });
    return;
  }

  const encoded = encodeURIComponent(String(name));
  res.json({
    restaurant: name,
    links: [
      {
        platform: "美团外卖",
        label: "去美团外卖搜索",
        searchUrl: `https://i.meituan.com/s/${encoded}`,
      },
      {
        platform: "饿了么",
        label: "去饿了么搜索",
        searchUrl: `https://h5.ele.me/search?q=${encoded}`,
      },
    ],
  });
});

export default router;
