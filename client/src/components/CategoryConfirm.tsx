interface Props {
  category: string;
  onAccept: () => void;
  onReroll: () => void;
}

export default function CategoryConfirm({ category, onAccept, onReroll }: Props) {
  return (
    <div className="page">
      <h1 className="page-title">转盘结果</h1>
      <p className="page-subtitle">命运选择了...</p>

      <div className="category-result">
        <div className="category-badge">{category}</div>
        <p className="category-guess">看起来不错！要搜这类的店吗？</p>
      </div>

      <div className="confirm-buttons">
        <button className="btn btn-outline" onClick={onReroll}>
          再转一次
        </button>
        <button className="btn btn-primary" onClick={onAccept}>
          就吃这个！
        </button>
      </div>
    </div>
  );
}
