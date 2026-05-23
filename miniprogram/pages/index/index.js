var api = require('../../utils/api');

Page({
  data: { query: '', suggestions: [], selected: null },

  onInput(e) {
    var v = e.detail.value;
    this.setData({ query: v, selected: null });
    if (this._t) clearTimeout(this._t);
    if (v.trim().length < 2) { this.setData({ suggestions: [] }); return; }
    var that = this;
    this._t = setTimeout(function() {
      api.suggestLocation(v.trim()).then(function(data) {
        that.setData({ suggestions: (data && data.suggestions) || [] });
      }).catch(function() {});
    }, 300);
  },

  onSelect(e) {
    var s = this.data.suggestions[e.currentTarget.dataset.index];
    if (!s) return;
    var parts = s.location.split(',');
    this.setData({ selected: { name: s.name, lat: parseFloat(parts[1]) || 0, lng: parseFloat(parts[0]) || 0 }, query: s.name, suggestions: [] });
  },

  goNext() {
    var s = this.data.selected;
    var name = s ? s.name : this.data.query.trim();
    var lat = s ? s.lat : 0, lng = s ? s.lng : 0;
    if (!name) return;
    wx.navigateTo({ url: '/pages/dietary/dietary?name=' + encodeURIComponent(name) + '&lat=' + lat + '&lng=' + lng });
  },
});
