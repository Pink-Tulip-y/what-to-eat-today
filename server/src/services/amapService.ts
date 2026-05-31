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

  // 无 API Key 时使用本地城市数据库做模糊匹配
  if (!key) return localSuggest(keywords);

  const url = `${BASE}/assistant/inputtips?key=${key}&keywords=${encodeURIComponent(keywords)}&city=`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== '1') return localSuggest(keywords);

  const results = (data.tips || [])
    .filter((t: any) => t.location && t.location !== '[]')
    .map((t: any) => ({
      name: t.name,
      address: t.address || '',
      location: typeof t.location === 'string' ? t.location : '',
      city: t.city || '',
      district: t.district || '',
    }));

  return results.length > 0 ? results : localSuggest(keywords);
}

// 本地热门地点数据库（无 API Key 时的降级方案）
const POPULAR_LOCATIONS: { name: string; address: string; location: string; city: string; district: string }[] = [
  { name: '北京大学', address: '海淀区颐和园路5号', location: '116.310316,39.992912', city: '北京', district: '海淀区' },
  { name: '清华大学', address: '海淀区双清路30号', location: '116.332253,40.008822', city: '北京', district: '海淀区' },
  { name: '望京SOHO', address: '朝阳区望京街10号', location: '116.480968,39.996365', city: '北京', district: '朝阳区' },
  { name: '三里屯太古里', address: '朝阳区三里屯路19号', location: '116.455359,39.936293', city: '北京', district: '朝阳区' },
  { name: '国贸CBD', address: '朝阳区建国门外大街1号', location: '116.461472,39.909508', city: '北京', district: '朝阳区' },
  { name: '王府井', address: '东城区王府井大街', location: '116.414150,39.914722', city: '北京', district: '东城区' },
  { name: '中关村', address: '海淀区中关村大街', location: '116.316802,39.984139', city: '北京', district: '海淀区' },
  { name: '西单', address: '西城区西单北大街', location: '116.376127,39.912955', city: '北京', district: '西城区' },
  { name: '五道口', address: '海淀区成府路', location: '116.339189,39.996472', city: '北京', district: '海淀区' },
  { name: '回龙观', address: '昌平区回龙观西大街', location: '116.335346,40.078888', city: '北京', district: '昌平区' },
  { name: '天通苑', address: '昌平区立汤路', location: '116.420201,40.074952', city: '北京', district: '昌平区' },
  { name: '上海外滩', address: '黄浦区中山东一路', location: '121.497543,31.240587', city: '上海', district: '黄浦区' },
  { name: '陆家嘴', address: '浦东新区陆家嘴环路', location: '121.506377,31.245419', city: '上海', district: '浦东新区' },
  { name: '人民广场', address: '黄浦区人民大道', location: '121.478123,31.234426', city: '上海', district: '黄浦区' },
  { name: '南京路步行街', address: '黄浦区南京东路', location: '121.480142,31.239421', city: '上海', district: '黄浦区' },
  { name: '静安寺', address: '静安区南京西路1686号', location: '121.449914,31.228815', city: '上海', district: '静安区' },
  { name: '徐家汇', address: '徐汇区虹桥路1号', location: '121.442881,31.197725', city: '上海', district: '徐汇区' },
  { name: '五角场', address: '杨浦区淞沪路', location: '121.518929,31.302782', city: '上海', district: '杨浦区' },
  { name: '广州塔', address: '海珠区阅江西路222号', location: '113.329439,23.109207', city: '广州', district: '海珠区' },
  { name: '天河城', address: '天河区天河路208号', location: '113.327536,23.136070', city: '广州', district: '天河区' },
  { name: '珠江新城', address: '天河区花城大道', location: '113.328857,23.125410', city: '广州', district: '天河区' },
  { name: '深圳福田CBD', address: '福田区福华三路', location: '114.063743,22.541097', city: '深圳', district: '福田区' },
  { name: '南山科技园', address: '南山区科技南路', location: '113.955296,22.542764', city: '深圳', district: '南山区' },
  { name: '杭州西湖', address: '西湖区龙井路1号', location: '120.141417,30.240850', city: '杭州', district: '西湖区' },
  { name: '成都春熙路', address: '锦江区春熙路', location: '104.083869,30.658751', city: '成都', district: '锦江区' },
  { name: '武汉光谷', address: '洪山区珞喻路', location: '114.402064,30.510716', city: '武汉', district: '洪山区' },
  { name: '南京新街口', address: '秦淮区中山南路', location: '118.789985,32.041582', city: '南京', district: '秦淮区' },
  { name: '重庆解放碑', address: '渝中区民族路', location: '106.582882,29.563733', city: '重庆', district: '渝中区' },
  { name: '西安钟楼', address: '碑林区东大街', location: '108.950529,34.264579', city: '西安', district: '碑林区' },
  { name: '长沙五一广场', address: '天心区五一大道', location: '112.980896,28.198488', city: '长沙', district: '天心区' },
];

function localSuggest(keywords: string): LocationSuggestion[] {
  const kw = keywords.toLowerCase().trim();
  if (kw.length < 1) return [];

  const matches = POPULAR_LOCATIONS.filter(
    (p) =>
      p.name.toLowerCase().includes(kw) ||
      p.city.toLowerCase().includes(kw) ||
      p.district.toLowerCase().includes(kw) ||
      p.address.toLowerCase().includes(kw),
  );

  // 相关度排序：名称精确匹配 > 名称包含 > 区域包含
  matches.sort((a, b) => {
    const aExact = a.name.toLowerCase() === kw ? 1 : 0;
    const bExact = b.name.toLowerCase() === kw ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    const aName = a.name.toLowerCase().startsWith(kw) ? 1 : 0;
    const bName = b.name.toLowerCase().startsWith(kw) ? 1 : 0;
    return bName - aName;
  });

  return matches.slice(0, 6);
}
