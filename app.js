//app.jsvar
var aldstat = require("./utils/ald-stat.js");
var util = require('./utils/util.js'); 
App({
  onLaunch: function () {
    var that = this;
    var local = util.cacheGet('local');
    if (local) {
      this.globalData.city = local.city;
      this.globalData.cityname = local.cityname;
    }
    wx.login({
      success: function (res) {
        if (res.code) {
          util.cachePut('code',res.code);
        }
      }
    });
    wx.checkSession({
      fail: function () {
        wx.login({
          success: function (res) {
            if (res.code) {
              util.cachePut('code',res.code);
            }
          }
        });
      }
    })
    that.globalData.device_id = util.genNonDuplicateID(8);
    util.refreshToken(this.globalData.city, this.globalData.device_id);    
  },
  onShow: function (options) {
    var that = this;
    if (options.query.city && options.query.city != this.globalData.city) {
      that.globalData.city = options.query.city;
      var data = { 'city': options.query.city };
      util.apiRequest('5a14d60574204', 'GET', data, function (res) {
        if (res.data.code == '1') {
          var local = {};
          res.data.data.forEach(function (val, index, arr) {
            if (val.city == options.query.city){
              local.city = val.city;
              local.cityname = val.city_name;
            }
          })
          util.cachePut('local', local);
          that.globalData.city = local.city;
          that.globalData.cityname = local.cityname;
          that.getConfig(function () { });
        }
      });
    }else{
      this.getConfig(function () { });
    }
  },
  getShareReturn: function (title, path, imageUrl){
    var obj = {};
    obj.title = title;
    obj.path = path;
    if (imageUrl)  obj.imageUrl = imageUrl;
    return obj;
  },
  getConfig: function(resolve){
    var that = this;
    var city = this.globalData.city;
    var cacheKey = city + 'config';
    var config = util.cacheGet(cacheKey);
    if (config) {
      that.globalData.config = config;
      resolve(config);
    }else{
      var data = { 'city': city };
      util.apiRequest('58c8fdaa79e80', 'GET', data, function(res) {
        if (res.data.code == '1'){
          var config = res.data.data;
          that.globalData.config = config;
          util.cachePut(cacheKey, config, 7200);
          resolve(config);
        }
      });
    }
  },
  formatSpecial: function (special, limit, business_key, house_comefrom){
    var limit = limit || 0;
    var that = this;
    var specialArr = new Array();
    if (special) specialArr = special.split(',');
    var res = new Array();
    if (specialArr.length > 0) {
      specialArr.forEach(function (val, index, arr) {
        var id = val;
        that.globalData.config.special.forEach(function (v, i, a) {
          if (v['key'] == val) res[index] = v['value'];
        });
      });
    }
    if (business_key && business_key == 999){
      res.unshift('爱租月付');
    }
    if (house_comefrom) {
      if (house_comefrom == '1') res.unshift('公寓');
      if (house_comefrom == '2') res.unshift('个人好房');
    }
    return limit>0?res.slice(0, limit):res;
  },
  globalData: {
    userinfo:{},
    device_id: '', 
    from:'6',
    city: 'nj',
    cityname: '南京',
    config: {} //业务相关配置数据，已初始化,尽量使用appInstance.getConfig(function())回调避免异步问题
  },
  fn:{//一些公用的函数
    deepClone:function(obj){//深克隆对象
      var o = {};
      var str = JSON.stringify(obj);
      o = JSON.parse(str);
      return o;
    },
  },
  getUtil: util
})