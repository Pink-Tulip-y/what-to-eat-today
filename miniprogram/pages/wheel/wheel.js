var CATS = ['川菜','粤菜','日料','韩餐','烧烤','火锅','快餐','面食','小吃','西餐','东南亚菜','东北菜'];
var CLRS = ['#FF6B6B','#FFB347','#87CEEB','#98FB98','#DDA0DD','#F0E68C','#FF8C69','#20B2AA','#BA55D3','#3CB371','#FF7F50','#6495ED'];

Page({
  data: {
    rotation: 0,
    spinning: false,
    hasSpun: false,
    locName: '', lat: 0, lng: 0, excludes: '',
    segments: [],
  },

  onLoad(options) {
    var segs = CATS.map(function(cat, i) {
      return {
        label: cat,
        color: CLRS[i],
        rotate: i * 30,
      };
    });
    this.setData({
      locName: decodeURIComponent(options.name || ''),
      lat: Number(options.lat || 0),
      lng: Number(options.lng || 0),
      excludes: decodeURIComponent(options.excludes || ''),
      segments: segs,
    });
  },

  spin() {
    if (this.data.spinning) return;
    this.setData({ spinning: true, hasSpun: true });
    var extra = 2100 + Math.floor(Math.random() * 2100);
    var newRot = this.data.rotation + extra;
    this.setData({ rotation: newRot });

    var ARC = 360 / CATS.length;
    var finalAngle = newRot % 360;
    var normalized = (360 - (finalAngle % 360)) % 360;
    var idx = Math.floor(normalized / ARC) % CATS.length;
    var cat = CATS[idx];
    var that = this;

    setTimeout(function() {
      wx.navigateTo({
        url: '/pages/confirm/confirm?name=' + encodeURIComponent(that.data.locName) +
          '&lat=' + that.data.lat + '&lng=' + that.data.lng +
          '&excludes=' + encodeURIComponent(that.data.excludes) +
          '&category=' + encodeURIComponent(cat),
      });
      that.setData({ spinning: false });
    }, 3600);
  },

  goBack() { wx.navigateBack(); },
});
