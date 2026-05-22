const CATEGORIES = ['川菜','粤菜','日料','韩餐','烧烤','火锅','快餐','面食','小吃','西餐','东南亚菜','东北菜'];
const COLORS = ['#FF6B6B','#FFB347','#87CEEB','#98FB98','#DDA0DD','#F0E68C','#FF8C69','#20B2AA','#BA55D3','#3CB371','#FF7F50','#6495ED'];

Page({
  data: {
    rotation: 0,
    spinning: false,
    locName: '',
    lat: 0, lng: 0, excludes: '',
  },

  onLoad(options) {
    this.setData({
      locName: decodeURIComponent(options.name || ''),
      lat: Number(options.lat || 0),
      lng: Number(options.lng || 0),
      excludes: decodeURIComponent(options.excludes || ''),
    });
    this.drawWheel();
  },

  drawWheel() {
    const ctx = wx.createCanvasContext('wheelCanvas');
    const S = CATEGORIES.length;
    const ARC = (2 * Math.PI) / S;
    const CX = 125; const CY = 125; const R = 115;

    CATEGORIES.forEach((cat, i) => {
      const start = i * ARC - Math.PI / 2;
      const end = start + ARC;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, start, end);
      ctx.setFillStyle(COLORS[i]);
      ctx.fill();
      ctx.setStrokeStyle('#fff');
      ctx.setLineWidth(2);
      ctx.stroke();

      const mid = start + ARC / 2;
      const tx = CX + R * 0.65 * Math.cos(mid);
      const ty = CY + R * 0.65 * Math.sin(mid);
      ctx.setFillStyle('#fff');
      ctx.setFontSize(12);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText(cat, tx, ty);
    });

    ctx.beginPath();
    ctx.arc(CX, CY, 30, 0, 2 * Math.PI);
    ctx.setFillStyle('#fff');
    ctx.setStrokeStyle('#ff6b35');
    ctx.setLineWidth(3);
    ctx.fill();
    ctx.stroke();
    ctx.setFillStyle('#ff6b35');
    ctx.setFontSize(14);
    ctx.fillText('GO', CX, CY);

    ctx.draw();
  },

  spin() {
    if (this.data.spinning) return;
    this.setData({ spinning: true });

    const extra = 1800 + Math.random() * 1800;
    const newRot = this.data.rotation + extra;
    this.setData({ rotation: newRot });

    const finalAngle = newRot % 360;
    const normalized = (360 - (finalAngle % 360)) % 360;
    const idx = Math.floor(normalized / (360 / CATEGORIES.length)) % CATEGORIES.length;
    const cat = CATEGORIES[idx];

    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/confirm/confirm?name=${encodeURIComponent(this.data.locName)}&lat=${this.data.lat}&lng=${this.data.lng}&excludes=${encodeURIComponent(this.data.excludes)}&category=${encodeURIComponent(cat)}`,
      });
      this.setData({ spinning: false });
    }, 3500);
  },

  goBack() { wx.navigateBack(); },
});
