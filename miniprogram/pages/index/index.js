// pages/index/index.js - 今日吃什么小程序首页
const api = require("../../utils/api");

Page({
  data: {
    query: "",
    suggestions: [],
    selected: null,
    gpsLoading: false,
    step: "location", // location | dietary | wheel | confirm | results
    excludes: [],
    category: "",
    results: [],
    source: "",
    loading: false,
    error: "",
  },

  onInput(e) {
    const value = e.detail.value;
    this.setData({ query: value, selected: null });

    if (value.trim().length < 2) {
      this.setData({ suggestions: [] });
      return;
    }

    // 防抖 300ms
    if (this._debounce) clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      api.suggestLocation(value.trim())
        .then((res) => {
          this.setData({ suggestions: res.suggestions || [] });
        })
        .catch(() => {
          this.setData({ suggestions: [] });
        });
    }, 300);
  },

  onSelect(e) {
    const index = e.currentTarget.dataset.index;
    const s = this.data.suggestions[index];
    if (!s) return;
    const parts = s.location.split(",");
    const lat = parseFloat(parts[1]);
    const lng = parseFloat(parts[0]);
    this.setData({
      selected: { name: s.name, lat, lng },
      query: s.name,
      suggestions: [],
    });
  },

  onGPS() {
    this.setData({ gpsLoading: true });
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData({
          selected: { name: `${res.latitude.toFixed(4)},${res.longitude.toFixed(4)}`, lat: res.latitude, lng: res.longitude },
          query: `${res.latitude.toFixed(4)},${res.longitude.toFixed(4)}`,
          gpsLoading: false,
        });
      },
      fail: () => {
        wx.showToast({ title: "定位失败", icon: "none" });
        this.setData({ gpsLoading: false });
      },
    });
  },

  onSubmit() {
    const { selected, query } = this.data;
    if (selected) {
      this.setData({ step: "dietary" });
    } else if (query.trim()) {
      this.setData({
        selected: { name: query.trim(), lat: 0, lng: 0 },
        step: "dietary",
      });
    }
  },

  // dietary
  onToggleDiet(e) {
    const key = e.currentTarget.dataset.key;
    const excludes = this.data.excludes;
    const idx = excludes.indexOf(key);
    if (idx >= 0) {
      excludes.splice(idx, 1);
    } else {
      excludes.push(key);
    }
    this.setData({ excludes: [...excludes] });
  },

  onDietNext() {
    // 转盘功能在小程序里简化为随机选分类
    const categories = ["川菜","粤菜","日料","韩餐","烧烤","火锅","快餐","面食","小吃","西餐","东南亚菜","东北菜"];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    this.setData({ category: cat, step: "confirm" });
  },

  onConfirmBack() {
    this.onDietNext(); // 重新随机
  },

  onConfirmGo() {
    this.setData({ step: "results", loading: true, error: "" });
    const { selected, category, excludes } = this.data;
    if (!selected) return;

    api.searchRestaurants({
      location: selected.name,
      category: category,
      excludes: excludes,
      lat: selected.lat || undefined,
      lng: selected.lng || undefined,
    })
      .then((data) => {
        this.setData({
          results: data.results || [],
          source: data.source,
          loading: false,
        });
      })
      .catch((err) => {
        this.setData({ error: err.message || "网络错误", loading: false, results: [] });
      });
  },

  onRestart() {
    this.setData({
      step: "location", query: "", selected: null,
      excludes: [], category: "", results: [], source: "", loading: false, error: "",
    });
  },

  onBackToWheel() {
    this.setData({ step: "wheel" });
  },
});
