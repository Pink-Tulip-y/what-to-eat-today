import { PlatformInfo } from "../data/mockData";

export interface PlatformComparison {
  platform: PlatformInfo;
  effectivePrice: number; // 优惠后预估价格
  isCheapest: boolean;
}

export function comparePlatforms(platforms: PlatformInfo[]): PlatformComparison[] {
  const comparisons = platforms.map((p) => ({
    platform: p,
    effectivePrice: p.estimatedPrice - parseDiscount(p.discount),
    isCheapest: false,
  }));

  if (comparisons.length === 0) return [];

  // 找最低价
  let minPrice = Infinity;
  for (const c of comparisons) {
    if (c.effectivePrice < minPrice) {
      minPrice = c.effectivePrice;
    }
  }

  // 标记最便宜
  for (const c of comparisons) {
    c.isCheapest = c.effectivePrice === minPrice;
  }

  return comparisons;
}

function parseDiscount(discount: string): number {
  // 解析 "满30减8" → 8, "满40减18" → 18, "新用户减15" → 15, "会员免配送" → 0
  const match = discount.match(/减(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
