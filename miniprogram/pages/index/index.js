const { suggestLocation } = require('../../utils/api');

Page({
  data: {
    query: '',
    suggestions: [],
    selected: null,
    history: [],
    showOnboard: false,
    onboardStep: 0,
    steps: [
      { icon: '📍', title: '搜索地点', text: '输入你的位置，选一个精确的地点' },
      { icon: '🍽️', title: '选择忌口', text: '不吃辣、海鲜、猪肉？或者自己填' },
      { icon: '🎯', title: '转盘决定', text: '命运转盘帮你选类别，不喜欢可重来' },
      { icon: '🏪', title: '看结果下单', text: '高分好店、推荐菜和照片一键查看' },
    ],
  },

  onShow() {
    // 首次启动引导
    const seen = wx.getStorageSync('wte_onboard');
    if (!seen) {
      this.setData({ showOnboard: true });
    }
    // 历史记录
    try {
      const raw = wx.getStorageSync('wte_history');
      if (raw) this.setData({ history: JSON.parse(raw) });
    } catch {}
  },

  nextStep() {
    this.setData({ onboardStep: this.data.onboardStep + 1 });
  },
  closeOnboard() {
    wx.setStorageSync('wte_onboard', '1');
    this.setData({ showOnboard: false });
  },
  stopProp() {},

  onInput(e) {
    const v = e.detail.value;
    this.setData({ query: v, selected: null });
    if (this._timer) clearTimeout(this._timer);
    if (v.trim().length < 2) { this.setData({ suggestions: [] }); return; }

    this._timer = setTimeout(async () => {
      try {
        const data = await suggestLocation(v.trim());
        this.setData({ suggestions: (data && data.suggestions) ? data.suggestions.slice(0, 6) : [] });
      } catch {
        this.setData({ suggestions: [] });
      }
    }, 300);
  },

  onSelect(e) {
    const idx = e.currentTarget.dataset.index;
    const s = this.data.suggestions[idx];
    if (!s) return;
    const parts = s.location.split(',');
    const lng = parseFloat(parts[0]) || 0;
    const lat = parseFloat(parts[1]) || 0;
    this.setData({ selected: { name: s.name, lat, lng }, query: s.name, suggestions: [] });
  },

  goNext() {
    const { selected, query } = this.data;
    let name, lat = 0, lng = 0;
    if (selected) { name = selected.name; lat = selected.lat; lng = selected.lng; }
    else { name = query.trim(); }
    if (!name) return;
    wx.navigateTo({ url: '/pages/dietary/dietary?name=' + encodeURIComponent(name) + '&lat=' + lat + '&lng=' + lng });
  },

  replayHistory(e) {
    const loc = e.currentTarget.dataset.location;
    const cat = e.currentTarget.dataset.category;
    wx.navigateTo({ url: '/pages/results/results?location=' + encodeURIComponent(loc) + '&category=' + encodeURIComponent(cat) + '&excludes=&lat=0&lng=0' });
  },
});
