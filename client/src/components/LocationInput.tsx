import { useState, useRef, useEffect } from 'react';
import type { LocationSuggestion, SelectedLocation } from '../types';

interface Props {
  onNext: (location: SelectedLocation) => void;
}

export default function LocationInput({ onNext }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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
        // 1) 先走后端代理（Railway 有美国 IP 可能被高德拦截）
        const res = await fetch(`/api/location/suggest?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        const backendResults = data.suggestions || [];

        // 2) 后端返回为空或明显是本地兜底数据时，浏览器直连高德（国内 IP 正常）
        if (backendResults.length === 0) {
          const direct = await fetch(
            `https://restapi.amap.com/v3/assistant/inputtips?key=4d9e35726103bd11095929ee54899a4e&keywords=${encodeURIComponent(value.trim())}&city=`
          );
          const amap = await direct.json();
          if (amap.status === '1' && amap.tips?.length > 0) {
            const mapped = amap.tips
              .filter((t: any) => t.location && t.location !== '[]')
              .map((t: any) => ({
                name: t.name,
                address: t.address || '',
                location: t.location,
                city: t.city || '',
                district: t.district || '',
              }));
            setSuggestions(mapped);
            setOpen(mapped.length > 0);
            return;
          }
        }

        setSuggestions(backendResults);
        setOpen(backendResults.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (s: LocationSuggestion) => {
    const [lng, lat] = s.location.split(',').map(Number);
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

  return (
    <div className="page">
      <h1 className="page-title">今天吃什么？</h1>
      <p className="page-subtitle">输入一个具体地点，帮你找附近的好外卖</p>

      <form onSubmit={handleSubmit}>
        <div className="search-wrapper" ref={wrapperRef}>
          <input
            className="location-input"
            type="text"
            placeholder="搜索地点，如：北京大学、望京SOHO..."
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
            autoFocus
            autoComplete="off"
          />
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
