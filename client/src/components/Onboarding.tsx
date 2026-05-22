import { useState, useEffect } from 'react';

const STEPS = [
  { icon: '📍', title: '搜索地点', text: '输入你的位置，选一个精确的地点，帮你找附近的外卖' },
  { icon: '🍽️', title: '选择忌口', text: '不吃辣、海鲜、猪肉？或者自己填任何忌口' },
  { icon: '🎯', title: '转盘决定', text: '命运转盘帮你选食物类别，不喜欢可以再转一次' },
  { icon: '🏪', title: '看结果下单', text: '查看附近高分好店、推荐菜和照片，一键跳转外卖平台' },
];

const SEEN_KEY = 'wte_onboarding_seen';

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(SEEN_KEY)) {
      setShow(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem(SEEN_KEY, '1');
    setShow(false);
  };

  if (!show) return null;

  const s = STEPS[step];

  return (
    <div className="onboarding-overlay" onClick={close}>
      <div className="onboarding-card" onClick={(e) => e.stopPropagation()}>
        <div className="onboarding-icon">{s.icon}</div>
        <div className="onboarding-title">{s.title}</div>
        <div className="onboarding-text">{s.text}</div>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 20 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === step ? 'var(--primary)' : 'var(--border)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary btn-large" onClick={() => setStep(step + 1)}>
            下一步
          </button>
        ) : (
          <button className="btn btn-primary btn-large" onClick={close}>
            开始使用
          </button>
        )}
        <button
          className="btn"
          style={{
            marginTop: 8, width: '100%', background: 'none',
            color: 'var(--text-secondary)', fontSize: 13,
          }}
          onClick={close}
        >
          跳过介绍
        </button>
      </div>
    </div>
  );
}
