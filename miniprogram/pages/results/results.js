const { searchRestaurants } = require('../../utils/api');

Page({
  data: {
    results: [],
    loading: true,
    error: '',
    locName: '',
    category: '川菜',
  },

  onLoad(options) {
    const loc = decodeURIComponent(options.location || '');
    const cat = decodeURIComponent(options.category || '');
    const exc = decodeURIComponent(options.excludes || '');
    const lat = Number(options.lat || 0);
    const lng = Number(options.lng || 0);

    this.setData({ locName: loc, category: cat });
    this.fetchResults(loc, cat, exc, lat, lng);
  },

  async fetchResults(loc, cat, exc, lat, lng) {
    this.setData({ loading: true, error: '' });
    try {
      const data = await searchRestaurants({
        location: loc,
        category: cat,
        excludes: exc ? exc.split(',').filter(Boolean) : [],
        lat, lng,
      });
      this.setData({ results: data.results || [], loading: false });
    } catch (err) {
      this.setData({ error: err.errMsg || '网络错误', loading: false });
    }
  },

  onRetry() {
    // re-call onLoad
    const pages = getCurrentPages();
    const current = pages[pages.length - 1];
    current.onLoad(current.options);
  },

  copyMeituan(e) {
    const name = e.currentTarget.dataset.name;
    wx.setClipboardData({
      data: 'https://i.meituan.com/s/' + encodeURIComponent(name),
      success: () => wx.showToast({ title: '链接已复制，去美团搜索', icon: 'none' }),
    });
  },

  copyEleme(e) {
    const name = e.currentTarget.dataset.name;
    wx.setClipboardData({
      data: 'https://h5.ele.me/search?q=' + encodeURIComponent(name),
      success: () => wx.showToast({ title: '链接已复制，去饿了么搜索', icon: 'none' }),
    });
  },

  copyDianping(e) {
    const name = e.currentTarget.dataset.name;
    wx.setClipboardData({
      data: 'https://m.dianping.com/search?keyword=' + encodeURIComponent(name),
      success: () => wx.showToast({ title: '链接已复制，去浏览器查看菜品照片', icon: 'none' }),
    });
  },

  goBack() { wx.navigateBack(); },
});
