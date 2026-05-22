export interface PlatformInfo {
  platform: '美团' | '饿了么' | '抖音外卖' | '百度外卖';
  deliveryFee: number;
  minOrder: number;
  discount: string;
  estimatedPrice: number;
  deliveryTime: number;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  city: string;
  district: string;
  rating: number;
  monthlySales: number;
  distance: number;
  platforms: PlatformInfo[];
  tags: string[];
  dishes: string[];
  photos: string[];
}

export interface PlatformComparison {
  platform: PlatformInfo;
  effectivePrice: number;
  isCheapest: boolean;
}

export interface OrderLink {
  platform: string;
  label: string;
  url?: string;
  searchUrl: string;
}

export interface SearchResponse {
  source: 'amap' | 'mock';
  location: {
    input: string;
    resolved?: string;
    lat?: number;
    lng?: number;
  };
  results: Restaurant[];
}

export interface LocationSuggestion {
  name: string;
  address: string;
  location: string;   // "lng,lat"
  city: string;
  district: string;
}

export interface SelectedLocation {
  name: string;
  lat: number;
  lng: number;
}

export type PageStep =
  | 'location'
  | 'dietary'
  | 'wheel'
  | 'confirm'
  | 'results';
