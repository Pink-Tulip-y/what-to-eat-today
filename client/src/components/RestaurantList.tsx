import { useEffect, useState, useRef, useCallback } from "react";
import type { Restaurant, SearchResponse, SelectedLocation } from "../types";
import { searchPoiDirect } from "../amapDirect";
import ResultCard from "./ResultCard";

interface Props {
  location: SelectedLocation;
  category: string;
  excludes: string[];
  onBack: () => void;
  onRestart: () => void;
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-stats" />
      <div className="skeleton skeleton-tags" />
      <div className="skeleton skeleton-btn" />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="restaurant-list">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export default function RestaurantList({ location, category, excludes, onBack, onRestart }: Props) {
  const [results, setResults] = useState<Restaurant[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const fetchResults = useCallback(() => {
    // 取消上一次请求
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("location", location.name);
    params.set("category", category);
    if (location.lat && location.lng) {
      params.set("lat", String(location.lat));
      params.set("lng", String(location.lng));
    }
    if (excludes.length > 0) params.set("excludes", excludes.join(","));

    fetch(`/api/restaurants/search?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("服务器错误");
        return res.json();
      })
      .then(async (data: SearchResponse) => {
        if (controller.signal.aborted) return;

        // 后端返回空或 mock 数据时，浏览器直连高德（绕过 Railway 美国 IP 限制）
        if (
          (data.results.length === 0 || data.source === "mock") &&
          location.lat && location.lng &&
          location.lat !== 0 && location.lng !== 0
        ) {
          try {
            const direct = await searchPoiDirect(location.lng, location.lat, category);
            if (!controller.signal.aborted && direct.length > 0) {
              setResults(direct);
              setSource("amap");
              setLoading(false);
              return;
            }
          } catch { /* 直连失败，用后端返回值 */ }
        }

        setResults(data.results || []);
        setSource(data.source);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message || "网络连接失败");
        setResults([]);
        setLoading(false);
      });
  }, [location, category, excludes]);

  useEffect(() => {
    fetchResults();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchResults]);

  return (
    <div className="page">
      <div className="back-bar">
        <button className="back-btn" onClick={onBack} type="button">
          ← 换一类
        </button>
      </div>

      <h1 className="page-title">
        {category} · {location.name.length > 12 ? location.name.slice(0, 12) + "..." : location.name}
      </h1>
      <p className="page-subtitle">
        {loading ? "正在搜索..." : source === "amap" ? "高德地图实时数据" : "综合评分高 + 销量高"}
      </p>

      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="error-banner">
          <div className="error-banner-icon">🙀</div>
          <p className="error-banner-text">{error}</p>
          <button className="retry-btn" onClick={fetchResults}>
            ↻ 点击重试
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="error-banner">
          <div className="error-banner-icon">🔳</div>
          <p className="error-banner-text">
            附近没有找到符合条件的{category}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
            试试换个类别、扩大范围或调整忌口
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-outline" onClick={onBack} type="button">
              换一类
            </button>
            <button className="btn btn-primary" onClick={onRestart} type="button">
              重新开始
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="restaurant-list-header">
            找到 {results.length} 家好店
          </div>
          <div className="restaurant-list">
            {results.map((r) => (
              <ResultCard key={r.id} restaurant={r} />
            ))}
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={onBack}
              type="button"
            >
              换一类
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={onRestart}
              type="button"
            >
              重新开始
            </button>
          </div>
        </>
      )}
    </div>
  );
}
