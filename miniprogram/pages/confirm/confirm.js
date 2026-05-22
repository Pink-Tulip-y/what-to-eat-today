Page({
  data: {
    locName: '', lat: 0, lng: 0, excludes: '', category: '',
  },

  onLoad(options) {
    this.setData({
      locName: decodeURIComponent(options.name || ''),
      lat: Number(options.lat || 0),
      lng: Number(options.lng || 0),
      excludes: decodeURIComponent(options.excludes || ''),
      category: decodeURIComponent(options.category || ''),
    });
  },

  accept() {
    try {
      const raw = wx.getStorageSync('wte_history');
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({ location: this.data.locName, category: this.data.category, time: Date.now() });
      wx.setStorageSync('wte_history', JSON.stringify(arr.slice(0, 20)));
    } catch {}

    wx.navigateTo({
      url: `/pages/results/results?location=${encodeURIComponent(this.data.locName)}&category=${encodeURIComponent(this.data.category)}&excludes=${encodeURIComponent(this.data.excludes)}&lat=${this.data.lat}&lng=${this.data.lng}`,
    });
  },

  reroll() { wx.navigateBack(); },
});
