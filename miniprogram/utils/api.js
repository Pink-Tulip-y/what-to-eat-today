// 后端地址 (部署后替换为 Railway/Render 的 HTTPS 地址)
const BASE = 'http://bore.pub:63752';

function searchRestaurants(params) {
  return new Promise((resolve, reject) => {
    const qs = [];
    qs.push('location=' + encodeURIComponent(params.location));
    qs.push('category=' + encodeURIComponent(params.category));
    if (params.lat) qs.push('lat=' + params.lat);
    if (params.lng) qs.push('lng=' + params.lng);
    if (params.excludes.length > 0) qs.push('excludes=' + encodeURIComponent(params.excludes.join(',')));

    wx.request({
      url: BASE + '/api/restaurants/search?' + qs.join('&'),
      method: 'GET',
      success: (res) => resolve(res.data),
      fail: (err) => reject(err),
    });
  });
}

function suggestLocation(q) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE + '/api/location/suggest?q=' + encodeURIComponent(q),
      method: 'GET',
      success: (res) => resolve(res.data),
      fail: (err) => reject(err),
    });
  });
}

module.exports = { searchRestaurants, suggestLocation };
