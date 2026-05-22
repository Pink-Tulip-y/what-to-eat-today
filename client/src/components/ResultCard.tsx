import { useState } from 'react';
import type { Restaurant } from '../types';

interface Props {
  restaurant: Restaurant;
}

export default function ResultCard({ restaurant }: Props) {
  const [imgFailed, setImgFailed] = useState<Set<number>>(new Set());
  const searchName = encodeURIComponent(restaurant.name);
  const meituanUrl = `https://i.meituan.com/meishi/search?q=${searchName}`;
  const elemeUrl = `https://h5.ele.me/search?q=${searchName}`;
  const dianpingUrl = `https://m.dianping.com/search?keyword=${searchName}`;

  return (
    <div className="result-card">
      {restaurant.photos.length > 0 && (
        <div className="photo-strip">
          {restaurant.photos.map((url, i) => (
            <div key={i} className="photo-thumb">
              {!imgFailed.has(i) ? (
                <img
                  src={url}
                  alt={`${restaurant.name} 照片`}
                  loading="lazy"
                  onError={() => setImgFailed((s) => new Set(s).add(i))}
                />
              ) : (
                <div className="photo-placeholder">暂无图片</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="result-card-header">
        <span className="result-card-name">{restaurant.name}</span>
      </div>

      <div className="result-card-stats">
        {restaurant.rating > 0 && (
          <span className="stat-rating">★ {restaurant.rating}</span>
        )}
        {restaurant.monthlySales > 0 && (
          <span className="stat-sales">
            月售 {restaurant.monthlySales > 1000
              ? `${(restaurant.monthlySales / 1000).toFixed(1)}k`
              : restaurant.monthlySales}
          </span>
        )}
        {restaurant.distance > 0 && (
          <span className="stat-distance">{restaurant.distance}km</span>
        )}
      </div>

      {restaurant.dishes.length > 0 && (
        <div className="dish-tags">
          <span className="dish-label">推荐菜：</span>
          {restaurant.dishes.map((d, i) => (
            <span key={i} className="dish-tag">{d}</span>
          ))}
        </div>
      )}

      {restaurant.platforms.length > 0 && restaurant.platforms[0].estimatedPrice > 0 && (
        <p className="avg-price">人均 ¥{restaurant.platforms[0].estimatedPrice}</p>
      )}

      <a
        className="food-photo-link"
        href={dianpingUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        查看菜品照片 →
      </a>

      <div className="platform-links">
        <a
          className="platform-link meituan"
          href={meituanUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          去美团搜索
        </a>
        <a
          className="platform-link eleme"
          href={elemeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          去饿了么搜索
        </a>
      </div>
    </div>
  );
}
