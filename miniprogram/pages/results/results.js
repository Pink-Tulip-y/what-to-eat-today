var api = require('../../utils/api');

Page({
  data: { results: [], loading: true, error: '', locName: '', category: '' },

  onLoad(options) {
    var loc = decodeURIComponent(options.location || '');
    var cat = decodeURIComponent(options.category || '');
    var exc = decodeURIComponent(options.excludes || '');
    var lat = Number(options.lat || 0);
    var lng = Number(options.lng || 0);
    this.setData({ locName: loc, category: cat });
    this.doSearch(loc, cat, exc, lat, lng);
  },

  doSearch(loc, cat, exc, lat, lng) {
    var that = this;
    that.setData({ loading: true, error: '' });
    api.searchRestaurants({
      location: loc, category: cat,
      excludes: exc ? exc.split(',').filter(Boolean) : [],
      lat: lat, lng: lng,
    }).then(function(data) {
      that.setData({ results: (data && data.results) || [], loading: false });
    }).catch(function(err) {
      that.setData({ error: (err && err.message) || '网络错误', loading: false });
    });
  },

  onRetry() {
    var pages = getCurrentPages();
    var current = pages[pages.length - 1];
    current.onLoad(current.options);
  },

  copyMeituan(e) {
    var name = e.currentTarget.dataset.name;
    wx.setClipboardData({
      data: 'https://i.meituan.com/s/' + encodeURIComponent(name),
      success: function() { wx.showToast({ title: '已复制链接，去美团搜索', icon: 'none' }); },
    });
  },

  copyEleme(e) {
    var name = e.currentTarget.dataset.name;
    wx.setClipboardData({
      data: 'https://h5.ele.me/search?q=' + encodeURIComponent(name),
      success: function() { wx.showToast({ title: '已复制链接，去饿了么搜索', icon: 'none' }); },
    });
  },

  copyDianping(e) {
    var name = e.currentTarget.dataset.name;
    wx.setClipboardData({
      data: 'https://m.dianping.com/search?keyword=' + encodeURIComponent(name),
      success: function() { wx.showToast({ title: '已复制链接，查看菜品照片', icon: 'none' }); },
    });
  },

  goBack() { wx.navigateBack(); },
});
