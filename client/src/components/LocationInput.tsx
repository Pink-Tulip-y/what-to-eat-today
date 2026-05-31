import { useState, useRef, useEffect } from "react";
import type { LocationSuggestion, SelectedLocation } from "../types";

interface Props {
  onNext: (location: SelectedLocation) => void;
}

const INPUT_TIPS_KEY = "4d9e35726103bd11095929ee54899a4e";

export default function LocationInput({ onNext }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // 输入提示只能直连高德（需要来源 IP）
        const direct = await fetch(
          `https://restapi.amap.com/v3/assistant/inputtips?key=${INPUT_TIPS_KEY}&keywords=${encodeURIComponent(value.trim())}&city=`
        );
        const amap = await direct.json();
        if (amap.status === "1" && amap.tips?.length > 0) {
          const mapped = amap.tips
            .filter((t: any) => t.location && t.location !== "[]")
            .map((t: any) => ({
              name: t.name,
              address: Array.isArray(t.address) ? (t.address[0] || t.district || "") : (t.address || t.district || ""),
              location: typeof t.location === "string" ? t.location : "",
              city: Array.isArray(t.city) ? (t.city[0] || "") : (t.city || ""),
              district: t.district || "",
            }));
          setSuggestions(mapped.slice(0, 8));
          setOpen(true);
          return;
        }

        // 高德无结果或 Key 无效时，走后端本地兜底数据库
        const res = await fetch(`/api/location/suggest?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setOpen((data.suggestions || []).length > 0);
      } catch {
        try {
          const res = await fetch(`/api/location/suggest?q=${encodeURIComponent(value.trim())}`);
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setOpen((data.suggestions || []).length > 0);
        } catch {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (s: LocationSuggestion) => {
    const [lng, lat] = s.location.split(",").map(Number);
    setSelected({ name: s.name, lat, lng });
    setQuery(s.name);
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      onNext(selected);
    } else if (query.trim()) {
      // 没有匹配建议时，用原始输入（后端会地理编码）
      onNext({ name: query.trim(), lat: 0, lng: 0 });
    }
  };

  // GPS 定位
  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert("当前浏览器不支持定位");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsLoading(false);
        // 用高德逆地理编码获取地址名
        try {
          const res = await fetch(
            `https://restapi.amap.com/v3/geocode/regeo?key=${INPUT_TIPS_KEY}&location=${longitude},${latitude}`
          );
          const data = await res.json();
          if (data.status === "1" && data.regeocode) {
            const addr = data.regeocode.formatted_address || `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
            setSelected({ name: addr, lat: latitude, lng: longitude });
            setQuery(addr);
            return;
          }
        } catch { /* ignore */ }
        // 降级：直接用坐标
        setSelected({ name: `${latitude.toFixed(4)},${longitude.toFixed(4)}`, lat: latitude, lng: longitude });
        setQuery(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
      },
      () => {
        setGpsLoading(false);
        alert("定位失败，请手动输入地址");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="page">
      <h1 className="page-title">今天吃什么？</h1>
      <p className="page-subtitle">输入一个具体地点，帮你找附近的好外卖</p>

      <form onSubmit={handleSubmit}>
        <div className="search-wrapper" ref={wrapperRef}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="location-input"
              type="text"
              placeholder="搜索地点，如：北京大学、望京SOHO..."
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
              autoFocus
              autoComplete="off"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn"
              onClick={handleGPS}
              disabled={gpsLoading}
              style={{
                padding: "0 16px",
                whiteSpace: "nowrap",
                fontSize: 14,
                borderRadius: "var(--radius)",
                background: "var(--border)",
                color: "var(--text)",
              }}
            >
              {gpsLoading ? "定位中..." : "📍 定位"}
            </button>
          </div>
          {loading && <span className="search-spinner" />}

          {open && suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="suggestion-item"
                  onClick={() => handleSelect(s)}
                >
                  <span className="suggestion-name">{s.name}</span>
                  <span className="suggestion-addr">{s.address}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected && (
          <p className="selected-hint">
            已选择：{selected.name}
            {selected.lat !== 0 && ` (${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)})`}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-large"
          style={{ marginTop: 20 }}
          disabled={!query.trim()}
        >
          下一步
        </button>
      </form>
    </div>
  );
}
