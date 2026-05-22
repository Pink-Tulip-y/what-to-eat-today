import { useState, useCallback, useRef } from 'react';

interface Props {
  onResult: (category: string) => void;
  onBack: () => void;
}

const CATEGORIES = [
  '川菜', '粤菜', '日料', '韩餐', '烧烤', '火锅',
  '快餐', '面食', '小吃', '西餐', '东南亚菜', '东北菜',
];

const COLORS = [
  '#FF6B6B', '#FFB347', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C',
  '#FF8C69', '#20B2AA', '#BA55D3', '#3CB371', '#FF7F50', '#6495ED',
];

const SEGMENT_COUNT = CATEGORIES.length;
const ARC = 360 / SEGMENT_COUNT;
const CX = 150;
const CY = 150;
const R = 140;

function polarToCartesian(angle: number): { x: number; y: number } {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function describeArc(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export default function SpinningWheel({ onResult, onBack }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const hasSpun = useRef(false);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    const extraRotation = 1800 + Math.random() * 1800; // 5-10 full rotations
    const newRotation = rotation + extraRotation;
    setRotation(newRotation);

    const finalAngle = (newRotation % 360);
    // pointer is at top (0°), so the winning segment is at top
    const normalizedAngle = (360 - (finalAngle % 360)) % 360;
    const index = Math.floor(normalizedAngle / ARC) % SEGMENT_COUNT;

    setTimeout(() => {
      setSpinning(false);
      hasSpun.current = true;
      onResult(CATEGORIES[index]);
    }, 4200);
  }, [spinning, rotation, onResult]);

  return (
    <div className="page">
      <div className="back-bar">
        <button className="back-btn" onClick={onBack}>
          ← 返回修改忌口
        </button>
      </div>

      <h1 className="page-title">转盘帮你选！</h1>
      <p className="page-subtitle">点击按钮，让命运决定今天吃什么</p>

      <div className="wheel-container">
        <div className="wheel-wrapper">
          <div className="wheel-pointer" />
          <svg
            className="wheel-svg"
            viewBox="0 0 300 300"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {CATEGORIES.map((cat, i) => {
              const startAngle = i * ARC;
              const endAngle = startAngle + ARC;
              const midAngle = startAngle + ARC / 2;
              const textR = R * 0.62;
              const textRad = (midAngle - 90) * (Math.PI / 180);
              const tx = CX + textR * Math.cos(textRad);
              const ty = CY + textR * Math.sin(textRad);

              return (
                <g key={cat}>
                  <path
                    d={describeArc(startAngle, endAngle)}
                    fill={COLORS[i]}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fff"
                    fontSize="14"
                    fontWeight="600"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {cat}
                  </text>
                </g>
              );
            })}
            <circle cx={CX} cy={CY} r="30" fill="#fff" stroke="var(--primary)" strokeWidth="3" />
          </svg>
          <div className="wheel-center">GO</div>
        </div>

        <button className="spin-btn" onClick={spin} disabled={spinning}>
          {spinning ? '转盘中...' : hasSpun.current ? '再转一次' : '🎯 开始转动'}
        </button>
      </div>
    </div>
  );
}
