const { suggestLocation } = require('../../utils/api');

Page({
  data: {
    query: '',
    suggestions: [],
    selected: null,
    history: [],
    loading: false,
  },

  onShow() {
    try {
      const raw = wx.getStorageSync('wte_history');
      if (raw) this.setData({ history: JSON.parse(raw) });
    } catch {}
  },

  onInput(e) {
    const v = e.detail.value;
    this.setData({ query: v, selected: null });
    if (this._timer) clearTimeout(this._timer);
    if (v.trim().length < 2) { this.setData({ suggestions: [] }); return; }

    this._timer = setTimeout(async () => {
      this.setData({ loading: true });
      try {
        const data = await suggestLocation(v.trim());
        this.setData({ suggestions: data.suggestions || [], loading: false });
      } catch {
        this.setData({ suggestions: [], loading: false });
      }
    }, 300);
  },

  onSelect(e) {
    const s = e.currentTarget.dataset.suggestion;
    const [lng, lat] = s.location.split(',').map(Number);
    this.setData({ selected: { name: s.name, lat, lng }, query: s.name, suggestions: [] });
  },

  goNext() {
    const { selected, query } = this.data;
    let name, lat = 0, lng = 0;
    if (selected) { name = selected.name; lat = selected.lat; lng = selected.lng; }
    else { name = query.trim(); }

    if (!name) return;
    wx.navigateTo({ url: `/pages/dietary/dietary?name=${encodeURIComponent(name)}&lat=${lat}&lng=${lng}` });
  },

  replayHistory(e) {
    const h = e.currentTarget.dataset.history;
    wx.navigateTo({ url: `/pages/results/results?location=${encodeURIComponent(h.location)}&category=${encodeURIComponent(h.category)}&excludes=&lat=0&lng=0` });
  },
});
