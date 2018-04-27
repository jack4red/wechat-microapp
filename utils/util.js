var md5 = require('./md5.js'); 
var cache = require('./cache.js');
var baidu = {};
baidu.ak = '5eDQoWIvV63Uot443hmVX7ii9T4lk5X5';
var env = 'product';
//var env = 'develop';
var apiConfig = {};
if(env == 'develop'){
  apiConfig.api = 'https://aznapitest.house365.com/api/';
  apiConfig.version = 'v1.0';
  apiConfig.secret = 'JcJEdRYOapqLXtQPgPZNMRScqtaUbUrJ';
  apiConfig.app_id = '96625801';
}else{
  apiConfig.api = 'https://aznapi.house365.com/api/';
  apiConfig.version = 'v1.0';
  apiConfig.secret = 'WPCKeVQEmEyvrAGCvAloiWJkmihWdXdg';
  apiConfig.app_id = '40565712';
}

function refreshToken(city, device_id) {
  cache.remove("access_token");
  wx.request({
    url: apiConfig.api+'58bf98c1dcb63',
    data: getSign(city, device_id),
    method: 'GET',
    header: {
      'version': apiConfig.version
    },
    success: function (res) {
      if (res.data.code == '1') {
        var access_token = res.data.data.access_token;
        cache.put('access_token', access_token,6600);
      }
    }
  });
}

function randomString(len) {
  　　len = len || 32;
  　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  　　var maxPos = $chars.length;
  　　var pwd = '';
  　　for (var i = 0; i < len; i++) {
    　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  　　}
  　　return pwd;
}

function getSign(city,device_id) {
  var secret = apiConfig.secret;
  var data = {
    timestamp: Math.round(new Date().getTime() / 1000).toString(),
    app_id: apiConfig.app_id,
    rand_str: randomString(18),
    device_id: device_id,
  }
  var preStr = 'app_id=' + data.app_id + '&app_secret=' + secret
    + '&device_id=' + data.device_id + '&rand_str=' + data.rand_str + '&timestamp=' + data.timestamp;
  data.signature = md5.hexMD5(preStr);
  data.city = city;
  return data;
}

/*获取当前页url*/
function apiRequest(token, method, data, resolve, isHideLoad, isContrlHide) {//参数说明isHideLoad是否显示加载动画,
                                                                              // isContrlHide是否控制隐藏，默认自动不控制
  if (!isHideLoad){
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    })
  }
  var times = setInterval(function(){
    var access_token = cache.get("access_token");
    if (access_token) {
      clearInterval(times);
      var header = {
        'access-token': access_token,
        'version': apiConfig.version
      }
      var cacheKey = getUserinfoKey();
      var userinfo = cache.get(cacheKey);
      if (userinfo){
        header['user-token'] = userinfo.sso_token
      }
      if (method == 'POST' || method == 'post'){
        header['content-type'] = 'application/x-www-form-urlencoded';
      }
      wx.request({
        url: apiConfig.api + token,
        method: method,
        header: header,
        data: data,
        complete: function (res) {
          console.log(apiConfig.api + token);
          console.log(header);
          console.log(data);
          console.log(res);
          resolve(res);
          if (!isContrlHide){
            wx.hideLoading();
          }
          if (res.data.code == '-14') {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      })
    }
  }, 100);
}

function genNonDuplicateID(randomLength) {
  return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36)
}

function copyobj(arr) {
  var data = {};
  data = JSON.parse(JSON.stringify(arr));
  return data;
}

function apiUpload(city,tempFilePath,width,resolve){
  var width = width || '';
  wx.uploadFile({
    url: apiConfig.api +'5abda735eb675',
    filePath: tempFilePath,
    name: 'fd',
    header: {
      'content-type': 'multipart/form-data',
      'version': apiConfig.version
    },
    formData: {
      'city':city,
      'file':'fd',
      'size': width
    },
    success: function (res) {
      resolve(res);
    }
  })
}

function getUserinfoKey(){
  var cacheKey = env+"userinfo";
  return cacheKey;
}

var bmap = require('./bmap-wx.min.js');
function freshLocal(city, resolve) {
  var local = {};
  // 引入SDK核心类
  var BMap = new bmap.BMapWX({
    ak: baidu.ak
  });
  var fail = function (data) {
    local.city = '';
    local.cityname = '';
    resolve(local)
  };
  var success = function (data) {
    var local_cityname = data.originalData.result.addressComponent.city;
    local_cityname = local_cityname.replace('市', '');
    local.city = '';
    local.cityname = local_cityname;
    var data = { 'city': city };
    apiRequest('5a14d60574204', 'GET', data, function (res) {
      if (res.data.code == '1') {
        res.data.data.forEach(function (val, index, arr) {
          if (local_cityname.indexOf(val.city_name) != '-1') {
            local.city = val.city;
            local.cityname = val.city_name;
          }
        })
      }
      resolve(local);
    });
  }
  // 发起regeocoding检索请求 
  BMap.regeocoding({
    fail: fail,
    success: success
  })
}

module.exports = {
  apiConfig: apiConfig,
  refreshToken: refreshToken,
  apiRequest: apiRequest,
  genNonDuplicateID: genNonDuplicateID,
  copyobj: copyobj,
  cachePut: cache.put,
  cacheGet: cache.get,
  cacheRemove: cache.remove,
  cacheClear: cache.clear,
  apiUpload: apiUpload,
  freshLocal: freshLocal,
  getUserinfoKey: getUserinfoKey
}
