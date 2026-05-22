import restaurants, { Restaurant } from '../data/mockData';
import { geocode, searchPoi, filterByRating, AmapPoi } from './amapService';

interface SearchParams {
  location: string;
  category: string;
  excludes: string[];    // 忌口标签
  lat?: number;
  lng?: number;
}

export interface SearchResult {
  source: 'amap' | 'mock';
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
  if (!tag || typeof tag !== 'string') return [];
  return tag
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length <= 8 && !NON_DISH.test(s))
    .slice(0, 6);
}

function amapPoiToRestaurant(p: AmapPoi, category: string): Restaurant {
  return {
    id: p.id,
    name: p.name,
    category,
    city: '',
    district: '',
    rating: parseFloat(p.biz_ext?.rating || '0') || 0,
    monthlySales: 0,
    distance: Math.round((p.distance / 1000) * 10) / 10,
    platforms: [
      {
        platform: '美团',
        deliveryFee: 0,
        minOrder: 0,
        discount: '',
        estimatedPrice: parseFloat(p.biz_ext?.cost || '0') || 0,
        deliveryTime: 0,
      },
      {
        platform: '饿了么',
        deliveryFee: 0,
        minOrder: 0,
        discount: '',
        estimatedPrice: parseFloat(p.biz_ext?.cost || '0') || 0,
        deliveryTime: 0,
      },
    ],
    tags: [],
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

      // 忌口过滤
      const finalResults = excludes.length > 0
        ? results.filter((r) =>
            !r.tags.some((tag) =>
              excludes.some((ex) => tag.toLowerCase().includes(ex.toLowerCase())),
            ),
          )
        : results;

      return {
        source: 'amap',
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
    if (location) {
      const loc = location.toLowerCase();
      const matchCity = r.city.toLowerCase().includes(loc) || loc.includes(r.city.toLowerCase());
      const matchDistrict = r.district.toLowerCase().includes(loc) || loc.includes(r.district.toLowerCase());
      if (!matchCity && !matchDistrict) return false;
    }
    if (excludes.length > 0) {
      const hasExcluded = r.tags.some((tag) =>
        excludes.some((ex) => tag.toLowerCase().includes(ex.toLowerCase())),
      );
      if (hasExcluded) return false;
    }
    return true;
  });

  const maxSales = Math.max(...results.map((r) => r.monthlySales), 1);
  results.sort((a, b) => {
    const scoreA = a.rating * 0.6 + (a.monthlySales / maxSales) * 0.4;
    const scoreB = b.rating * 0.6 + (b.monthlySales / maxSales) * 0.4;
    return scoreB - scoreA;
  });

  return {
    source: 'mock',
    location: { input: location },
    results,
  };
}
