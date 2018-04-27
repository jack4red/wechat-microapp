//city.js
var bmap = require('../../utils/bmap-wx.min.js');
var wxMarkerData = [];
var appInstance = getApp();
Page({
  data: {
    qqmapsdk: '',
    city: '',
    all_city: {},
    local_cityname: '', //定位城市

    markers: [],
    latitude: '118.741174',
    longitude: '31.990579',
    rgcData: {}
  },
  makertap: function (e) {
    var that = this;
    var id = e.markerId;
    that.showSearchInfo(wxMarkerData, id);
  },
  showSearchInfo: function (data, i) {
    var that = this;
    that.setData({
      rgcData: {
        address: '地址：' + data[i].address + '\n',
        desc: '描述：' + data[i].desc + '\n',
        business: '商圈：' + data[i].business
      }
    });
  },
  //事件处理函数
  onLoad: function () {
    var that = this;
    //渲染开通城市数据
    var data = { 'city': appInstance.globalData.city };
    appInstance.getUtil.apiRequest('5a14d60574204', 'GET', data, function (res) {
      if (res.data.code == '1') {
        that.setData({ all_city: res.data.data });
      }
    });
    that.setData({ city: appInstance.globalData.city });
  },
  onShow:function(){
    this.freshen_local();
  },
  //重新定位
  freshen_local: function () {
    var that = this;
    appInstance.getUtil.freshLocal(appInstance.globalData.city, function (res) {
      var city = res.city;
      var cityname = res.cityname;
      if (!res.city) {
        cityname += '(暂未开通)';
      }
      that.setData({ local_city: city });
      that.setData({ local_cityname: cityname });
      if (that.data.local_cityname == '') {
        that.setData({ local_cityname: '无法定位' });
      }
    });  
  },
  navigatorBack:function(e){
    var city = e.currentTarget.dataset.city;
    var city_name = e.currentTarget.dataset.cityname;
    if (city) {
      appInstance.globalData.city = city;
      appInstance.globalData.cityname = city_name;
      var local = {};
      local.city = appInstance.globalData.city;
      local.cityname = appInstance.globalData.cityname;
      appInstance.getUtil.cachePut('local',local);
      wx.navigateBack({
        delta: 1
      })
    }
  }
})
