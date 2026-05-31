// 浏览器直连高德 API（绕过 Railway 美国 IP 拦截）
// 高德 Key 由后端 /api/config 提供（不回写 .env），无时用 fallback
let AMAP_KEY = "";

// 从后端获取配置（防止 Key 硬编码在前端源码里）
let keyLoaded = false;
async function loadKey() {
  if (keyLoaded) return;
  try {
    const res = await fetch("/api/config/key");
    if (res.ok) {
      const data = await res.json();
      AMAP_KEY = data.amapKey || "";
    }
  } catch { /* 降级使用 fallback */ }
  keyLoaded = true;
}

interface AmapPoi {
  id: string;
  name: string;
  address: string;
  location: string;
  distance: string;
  biz_ext?: { rating?: string; cost?: string };
  tag?: string;
}

export async function searchPoiDirect(
  lng: number,
  lat: number,
  keywords: string,
): Promise<import("./types").Restaurant[]> {
  await loadKey();
  const key = AMAP_KEY;
  if (!key) return []; // 无 Key 时直接返回空，走后端 mock

  const params = new URLSearchParams({
    key,
    keywords,
    location: `${lng},${lat}`,
    radius: "3000",
    types: "050000",
    offset: "10",
    page: "1",
    extensions: "all",
  });

  const res = await fetch(`https://restapi.amap.com/v3/place/around?${params}`);
  const data = await res.json();

  if (data.status !== "1" || !data.pois?.length) return [];

  return (data.pois as AmapPoi[]).map((p) => ({
    id: p.id,
    name: p.name,
    category: keywords,
    city: "",
    district: p.address?.slice(0, 20) || "",
    rating: parseFloat(p.biz_ext?.rating || "0") || 0,
    monthlySales: 0,
    distance: Math.round((parseInt(p.distance, 10) || 0) / 100) / 10,
    platforms: [
      {
        platform: "美团" as const,
        deliveryFee: 0,
        minOrder: 0,
        discount: "",
        estimatedPrice: parseFloat(p.biz_ext?.cost || "0") || 0,
        deliveryTime: 0,
      },
      {
        platform: "饿了么" as const,
        deliveryFee: 0,
        minOrder: 0,
        discount: "",
        estimatedPrice: parseFloat(p.biz_ext?.cost || "0") || 0,
        deliveryTime: 0,
      },
    ],
    tags: [],
    dishes: typeof p.tag === "string"
      ? p.tag.split(",").map(s => s.trim()).filter(s => s.length > 1).slice(0, 6)
      : [],
    photos: [],
  }));
}
