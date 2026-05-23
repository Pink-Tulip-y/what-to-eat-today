Page({
  data: {
    selected: [],
    customItems: [],
    showInput: false,
    customVal: '',
    locName: '',
    lat: 0, lng: 0,
    options: [
      { key: '辣', label: '不吃辣' }, { key: '海鲜', label: '不吃海鲜' },
      { key: '猪肉', label: '不吃猪肉' }, { key: '牛肉', label: '不吃牛肉' },
      { key: '羊肉', label: '不吃羊肉' }, { key: '素食', label: '素食' },
      { key: '清真', label: '清真' },
    ],
  },

  onLoad(options) {
    this.setData({
      locName: decodeURIComponent(options.name || ''),
      lat: Number(options.lat || 0),
      lng: Number(options.lng || 0),
    });
  },

  toggle(e) {
    const key = e.currentTarget.dataset.key;
    const sel = [...this.data.selected];
    const idx = sel.indexOf(key);
    if (idx > -1) sel.splice(idx, 1); else sel.push(key);
    this.setData({ selected: sel });
  },

  onCustomInput(e) { this.setData({ customVal: e.detail.value }); },
  openInput() { this.setData({ showInput: true }); },

  addCustom() {
    const v = this.data.customVal.trim();
    if (v && this.data.customItems.indexOf(v) === -1) {
      this.setData({ customItems: [...this.data.customItems, v], customVal: '', showInput: false });
    } else {
      this.setData({ customVal: '', showInput: false });
    }
  },

  removeCustom(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({ customItems: this.data.customItems.filter(c => c !== item) });
  },

  goNext() {
    const all = [...this.data.selected, ...this.data.customItems];
    wx.navigateTo({
      url: '/pages/wheel/wheel?name=' + encodeURIComponent(this.data.locName) +
        '&lat=' + this.data.lat + '&lng=' + this.data.lng +
        '&excludes=' + encodeURIComponent(all.join(',')),
    });
  },

  goBack() { wx.navigateBack(); },
});
