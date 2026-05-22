import { useState } from 'react';

interface Props {
  onNext: (excludes: string[]) => void;
  onBack: () => void;
}

const dietaryOptions = [
  { key: '辣', label: '不吃辣' },
  { key: '海鲜', label: '不吃海鲜' },
  { key: '猪肉', label: '不吃猪肉' },
  { key: '牛肉', label: '不吃牛肉' },
  { key: '羊肉', label: '不吃羊肉' },
  { key: '素食', label: '素食' },
  { key: '清真', label: '清真' },
];

export default function DietaryForm({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelected(next);
  };

  const addCustom = () => {
    const val = customValue.trim();
    if (val && !customItems.includes(val)) {
      setCustomItems([...customItems, val]);
    }
    setCustomValue('');
    setShowInput(false);
  };

  const removeCustom = (item: string) => {
    setCustomItems(customItems.filter((c) => c !== item));
  };

  const handleNext = () => {
    onNext([...Array.from(selected), ...customItems]);
  };

  return (
    <div className="page">
      <div className="back-bar">
        <button className="back-btn" onClick={onBack} type="button">
          ← 返回
        </button>
      </div>

      <h1 className="page-title">有什么忌口吗？</h1>
      <p className="page-subtitle">选好后我们会自动避开不合口味的食物</p>

      <div className="dietary-section">
        <h3>请选择你的偏好（可多选）</h3>
        <div className="dietary-tags">
          {dietaryOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`dietary-tag${selected.has(opt.key) ? ' selected' : ''}`}
              onClick={() => toggle(opt.key)}
            >
              {opt.label}
            </button>
          ))}

          {/* 自定义忌口项 */}
          {customItems.map((item) => (
            <button
              key={item}
              type="button"
              className="dietary-tag selected"
              onClick={() => removeCustom(item)}
            >
              {item} ✕
            </button>
          ))}

          {showInput ? (
            <span className="custom-input-row">
              <input
                className="custom-input"
                type="text"
                placeholder="输入忌口..."
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustom();
                  if (e.key === 'Escape') setShowInput(false);
                }}
                autoFocus
              />
              <button type="button" className="btn btn-sm btn-primary" onClick={addCustom}>
                添加
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="dietary-tag dietary-tag-other"
              onClick={() => setShowInput(true)}
            >
              + 其他
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={handleNext}
        >
          下一步，转盘来决定！
        </button>
        <p className="dietary-count">
          已选 {selected.size + customItems.length} 项忌口
          {selected.size + customItems.length === 0 && '，无特别忌口'}
        </p>
      </div>
    </div>
  );
}
