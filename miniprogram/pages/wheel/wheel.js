var CATS = ['川菜','粤菜','日料','韩餐','烧烤','火锅','快餐','面食','小吃','西餐','东南亚','东北菜'];
var CLRS = ['#FF6B6B','#FFB347','#87CEEB','#98FB98','#DDA0DD','#F0E68C','#FF8C69','#20B2AA','#BA55D3','#3CB371','#FF7F50','#6495ED'];

Page({
  data: {
    gradient: '',
    labels: [],
    rotation: 0, spinning: false, hasSpun: false,
    locName: '', lat: 0, lng: 0, excludes: '',
  },

  onLoad(options) {
    // 构建 conic-gradient
    var parts = [];
    var labels = [];
    var segAngle = 360 / CATS.length;
    for (var i = 0; i < CATS.length; i++) {
      var startAngle = i * segAngle;
      parts.push(CLRS[i] + ' ' + startAngle + 'deg ' + (startAngle + segAngle) + 'deg');
      // 标签放在每段中间
      labels.push({ name: CATS[i], angle: startAngle + segAngle / 2 - 90, idx: i });
    }
    this.setData({
      gradient: 'conic-gradient(' + parts.join(',') + ')',
      labels: labels,
      locName: decodeURIComponent(options.name || ''),
      lat: Number(options.lat || 0), lng: Number(options.lng || 0),
      excludes: decodeURIComponent(options.excludes || ''),
    });
  },

  spin() {
    if (this.data.spinning) return;
    this.setData({ spinning: true, hasSpun: true });

    var segAngle = 360 / CATS.length;
    var targetIdx = Math.floor(Math.random() * CATS.length);
    var cat = CATS[targetIdx];
    // 指针在顶部(0°)，segment 0 的右边是起始。指针指向 segment 中心时：
    // 需要让 segment targetIdx 的中心(angle = targetIdx * segAngle + segAngle/2) 对准指针
    var targetAngle = (targetIdx * segAngle + segAngle / 2);
    var extraFullRotations = 1800 + Math.floor(Math.random() * 1800);
    var newRot = this.data.rotation + extraFullRotations + (360 - targetAngle);
    this.setData({ rotation: newRot });

    var that = this;
    setTimeout(function() {
      wx.navigateTo({
        url: '/pages/confirm/confirm?name=' + encodeURIComponent(that.data.locName) +
          '&lat=' + that.data.lat + '&lng=' + that.data.lng +
          '&excludes=' + encodeURIComponent(that.data.excludes) +
          '&category=' + encodeURIComponent(cat),
      });
    }, 3600);
  },

  goBack() { wx.navigateBack(); },
});
