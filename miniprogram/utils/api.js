var BASE = 'https://what-to-eat-today-production-681f.up.railway.app';

function request(url) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      method: 'GET',
      success: function(res) {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error('Error ' + res.statusCode));
        }
      },
      fail: function(err) {
        reject(new Error(err.errMsg || 'Network error'));
      },
    });
  });
}

function searchRestaurants(params) {
  var qs = [];
  qs.push('location=' + encodeURIComponent(params.location));
  qs.push('category=' + encodeURIComponent(params.category));
  if (params.lat) qs.push('lat=' + params.lat);
  if (params.lng) qs.push('lng=' + params.lng);
  if (params.excludes.length > 0) qs.push('excludes=' + encodeURIComponent(params.excludes.join(',')));
  return request(BASE + '/api/restaurants/search?' + qs.join('&'));
}

function suggestLocation(q) {
  return request(BASE + '/api/location/suggest?q=' + encodeURIComponent(q));
}

module.exports = { searchRestaurants: searchRestaurants, suggestLocation: suggestLocation };
