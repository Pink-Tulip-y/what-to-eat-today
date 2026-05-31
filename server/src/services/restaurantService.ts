import restaurants, { Restaurant } from "../data/mockData";
import { geocode, searchPoi, filterByRating, AmapPoi } from "./amapService";

interface SearchParams {
  location: string;
  category: string;
  excludes: string[];    // 忌口标签
  lat?: number;
  lng?: number;
}

export interface SearchResult {
  source: "amap" | "mock";
  location: {
    input: string;
    resolved?: string;
    lat?: number;
    lng?: number;
  };
  results: Restaurant[];
}

// 从 AMap tag 字段解析菜品名，过滤掉非菜品标签
const NON_DISH = /^(川菜|粤菜|日料|韩餐|烧烤|火锅|快餐|面食|小吃|西餐|东南亚菜|东北菜|中餐|外国餐厅|茶点|串串|宵夜|早餐|快捷|经济实惠|服务好|一人食|高端|新颖|清真|素食|家常|融合菜|烤鱼|麻辣烫)$/;

function parseDishes(tag: unknown): string[] {
  if (!tag || typeof tag !== "string") return [];
  return tag
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length <= 8 && !NON_DISH.test(s))
    .slice(0, 6);
}

/** 从 address 或 location 解析城市和行政区 */
function parseCityDistrict(p: AmapPoi): { city: string; district: string } {
  const addr = (p.address || "").trim();
  // 城市后缀
  const cityMatch = addr.match(/^(北京|上海|广州|深圳|杭州|成都|武汉|南京|重庆|西安|长沙|天津|苏州|郑州)市?/);
  // 区后缀
  const districtMatch = addr.match(/(朝阳区|海淀区|西城区|东城区|丰台区|浦东新区|徐汇区|静安区|天河区|越秀区|福田区|南山区|西湖区|锦江区|洪山区|秦淮区|渝中区|碑林区|天心区)/);
  return {
    city: cityMatch ? cityMatch[1] : "",
    district: districtMatch ? districtMatch[1] : "",
  };
}

function amapPoiToRestaurant(p: AmapPoi, category: string): Restaurant {
  const { city, district } = parseCityDistrict(p);
  const tags: string[] = [];
  if (typeof p.tag === "string") {
    p.tag.split(",").forEach((t) => {
      const trimmed = t.trim();
      if (trimmed && !NON_DISH.test(trimmed)) tags.push(trimmed);
    });
  }
  return {
    id: p.id,
    name: p.name,
    category,
    city,
    district,
    rating: parseFloat(p.biz_ext?.rating || "0") || 0,
    monthlySales: 0,
    distance: Math.round((p.distance / 1000) * 10) / 10,
    platforms: [
      {
        platform: "美团",
        deliveryFee: 0,
        minOrder: 0,
        discount: "",
        estimatedPrice: parseFloat(p.biz_ext?.cost || "0") || 0,
        deliveryTime: 0,
      },
      {
        platform: "饿了么",
        deliveryFee: 0,
        minOrder: 0,
        discount: "",
        estimatedPrice: parseFloat(p.biz_ext?.cost || "0") || 0,
        deliveryTime: 0,
      },
    ],
    tags,
    dishes: parseDishes(p.tag),
    photos: p.photos || [],
  };
}

export async function searchRestaurants(params: SearchParams): Promise<SearchResult> {
  const { location, category, excludes, lat, lng } = params;

  // 尝试高德 API
  let coord: { lat: number; lng: number } | null = null;

  if (lat && lng) {
    // 前端已传递精确坐标，跳过地理编码
    coord = { lat, lng };
  } else {
    const geo = await geocode(location);
    if (geo) coord = { lat: geo.lat, lng: geo.lng };
  }

  if (coord) {
    const pois = await searchPoi({
      keywords: category,
      location: `${coord.lng},${coord.lat}`,
      radius: 5000,
    });

    const filtered = filterByRating(pois, 3.5);

    if (filtered.length > 0) {
      const results = filtered.map((p) => amapPoiToRestaurant(p, category));

      // 忌口过滤——优先用 tags，其次用 dishes
      const finalResults = excludes.length > 0
        ? results.filter((r) => {
            // 检查 tags 和 dishes 中是否包含忌口词
            const allWords = [...r.tags, ...r.dishes].map((w) => w.toLowerCase());
            return !excludes.some((ex) =>
              allWords.some((w) => w.includes(ex.toLowerCase()))
            );
          })
        : results;

      // 按评分排序
      finalResults.sort((a, b) => b.rating - a.rating);

      return {
        source: "amap",
        location: {
          input: location,
          lat: coord.lat,
          lng: coord.lng,
        },
        results: finalResults,
      };
    }
  }

  // 降级到模拟数据
  let results = restaurants.filter((r) => {
    if (category && !r.category.includes(category) && !category.includes(r.category)) {
      return false;
    }
    if (excludes.length > 0) {
      const hasExcluded = r.tags.some((tag) =>
        excludes.some((ex) => tag.toLowerCase().includes(ex.toLowerCase())),
      );
      if (hasExcluded) return false;
    }
    return true;
  });

  // 地点匹配：能匹配城市/行政区则优先，否则返回全部结果
  let locationMatched = results.filter((r) => {
    if (!location) return true;
    const loc = location.toLowerCase();
    const matchCity = r.city.toLowerCase().includes(loc) || loc.includes(r.city.toLowerCase());
    const matchDistrict = r.district.toLowerCase().includes(loc) || loc.includes(r.district.toLowerCase());
    return matchCity || matchDistrict;
  });

  // 如果地点匹配到了就用，否则用全部（避免用户输入地标名如"望京SOHO"时返回空）
  if (locationMatched.length > 0) {
    results = locationMatched;
  }

  const maxSales = Math.max(...results.map((r) => r.monthlySales), 1);
  results.sort((a, b) => {
    const scoreA = a.rating * 0.6 + (a.monthlySales / maxSales) * 0.4;
    const scoreB = b.rating * 0.6 + (b.monthlySales / maxSales) * 0.4;
    return scoreB - scoreA;
  });

  return {
    source: "mock",
    location: { input: location },
    results,
  };
}
