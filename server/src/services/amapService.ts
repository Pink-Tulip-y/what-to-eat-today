// 高德地图 Web API 服务
// 文档: https://lbs.amap.com/api/webservice/summary
import { cacheGet, cacheSet } from './cache';

const BASE = 'https://restapi.amap.com/v3';
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟

function getKey(): string {
  return process.env.AMAP_KEY || '';
}

export interface AmapPoi {
  id: string;
  name: string;
  address: string;
  location: string;       // "lng,lat"
  distance: number;       // 米
  tel: string;
  tag: string;            // 菜品标签，逗号分隔
  photos: string[];       // 照片 URL
  biz_ext?: {
    rating?: string;
    cost?: string;
  };
}

interface GeocodeResult {
  lng: number;
  lat: number;
  citycode: string;
  adcode: string;
}

// 地理编码：地址 → 经纬度
export async function geocode(address: string): Promise<GeocodeResult | null> {
  const key = getKey();
  if (!key) return null;

  const cacheKey = `geo:${address}`;
  const cached = cacheGet<GeocodeResult>(cacheKey);
  if (cached) return cached;

  const url = `${BASE}/geocode/geo?key=${key}&address=${encodeURIComponent(address)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== '1' || !data.geocodes?.length) return null;

  const [lng, lat] = data.geocodes[0].location.split(',').map(Number);
  const result = { lng, lat, citycode: data.geocodes[0].citycode, adcode: data.geocodes[0].adcode };
  cacheSet(cacheKey, result, CACHE_TTL);
  return result;
}

// 周边搜索：按中心点 + 半径搜索餐饮场所
export async function searchPoi(params: {
  keywords: string;
  location: string;       // "lng,lat" 中心点
  radius?: number;        // 米，默认 3000
  types?: string;
  offset?: number;
}): Promise<AmapPoi[]> {
  const key = getKey();
  if (!key) return [];

  const cacheKey = `poi:${params.keywords}:${params.location}:${params.radius || 3000}`;
  const cached = cacheGet<AmapPoi[]>(cacheKey);
  if (cached) return cached;

  const query = new URLSearchParams({
    key,
    keywords: params.keywords,
    location: params.location,
    radius: String(params.radius || 3000),
    types: params.types || '050000',
    offset: String(params.offset || 10),
    page: '1',
    extensions: 'all',
  });

  const url = `${BASE}/place/around?${query.toString()}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== '1') return [];

  const result = (data.pois || []).map((p: any) => {
    let dist = 0;
    if (typeof p.distance === 'number') {
      dist = p.distance;
    } else if (typeof p.distance === 'string') {
      dist = parseInt(p.distance, 10) || 0;
    }
    return {
      id: p.id,
      name: p.name,
      address: p.address,
      location: p.location,
      distance: dist,
      tel: p.tel || '',
      tag: typeof p.tag === 'string' ? p.tag : '',
      photos: Array.isArray(p.photos)
        ? p.photos.map((ph: any) => typeof ph.url === 'string' ? ph.url : '').filter((u: string) => u).slice(0, 2)
        : [],
      biz_ext: p.biz_ext,
    };
  });

  cacheSet(cacheKey, result, CACHE_TTL);
  return result;
}

// 获取有效的搜索结果（有评分且 ≥ 指定值）
export function filterByRating(pois: AmapPoi[], minRating = 3.5): AmapPoi[] {
  return pois.filter((p) => {
    const rating = parseFloat(p.biz_ext?.rating || '0');
    return rating >= minRating;
  });
}

// 输入提示：根据用户输入返回地点建议列表
export interface LocationSuggestion {
  name: string;
  address: string;
  location: string;   // "lng,lat"
  city: string;
  district: string;
}

export async function suggestLocations(keywords: string): Promise<LocationSuggestion[]> {
  const key = getKey();
  if (!key) return [];

  const url = `${BASE}/assistant/inputtips?key=${key}&keywords=${encodeURIComponent(keywords)}&city=`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== '1') return [];

  return (data.tips || [])
    .filter((t: any) => t.location && t.location !== '[]')
    .map((t: any) => ({
      name: t.name,
      address: t.address || '',
      location: typeof t.location === 'string' ? t.location : '',
      city: t.city || '',
      district: t.district || '',
    }));
}
