//index.js
var appInstance = getApp();
Page({
  data: {
    houseList:{},
    chooseHouse: {},//配置项数据
    city: '',//当前定位城市
    cityname:'',//当前定位城市

    selected:{},
    color:{},
    searchConfig:{},
    show:{
      street: '位置',
      lease_mode: '出租方式',
      rental_range: '租金',
      house_comefrom: '来源'
    },
    picker_index:''
  },
  onShareAppMessage: function (res) {
    var title = '爱租哪租房';
    var path = '/pages/index/index?city=' + appInstance.globalData.city;
    return appInstance.getShareReturn(title, path);
  },
  navigator: function (e) {
    var url = e.currentTarget.dataset.url;
    var key = e.currentTarget.dataset.key;
    var selected = {};
    var color = {};
    if (key == 'lease_mode') {
      var value = e.currentTarget.dataset.value;
      var index = e.currentTarget.dataset.index;
      selected.lease_mode = value;
      color.lease_mode = index;
    }
    if (key == 'house_comefrom') {
      var value = e.currentTarget.dataset.value;
      var index = e.currentTarget.dataset.index;
      selected.house_comefrom = value;
      color.house_comefrom = index;
    }
    if (key == 'special') {
      var value = e.currentTarget.dataset.value;
      selected.special = value;
      var temp = new Array();
      temp[value] = true;
      color.special = temp;
    }
    selected = JSON.stringify(selected);
    color = JSON.stringify(color);
    wx.navigateTo({
      url: url + '?selected=' + selected + '&color=' + color
    })
  },
  //快速找房 跳转到列表页 将数据data传到列表页
  quire_house:function(e){
    var url = e.currentTarget.dataset.url;
    var selected = JSON.stringify(this.data.selected);
    var color = JSON.stringify(this.data.color);
    wx.navigateTo({
      url: url + '?selected=' + selected + '&color=' + color
    })
  },
  onLoad: function () {
    var that = this;
    //定位接口有调用频率限制，打开首页不定位，影响效率
    appInstance.getUtil.freshLocal(appInstance.globalData.city, function (res) {
      if (res.city && res.city != appInstance.globalData.city) {
        // console.log('需要切换城市')
        wx.showModal({
          title: '提示',
          content: '当前定位城市是' + res.cityname +'，是否切换',
          success: function (result) {
            if (result.confirm) {
              appInstance.globalData.city = res.city;
              appInstance.globalData.cityname = res.cityname;
              var local = {};
              local.city = appInstance.globalData.city;
              local.cityname = appInstance.globalData.cityname;
              appInstance.getUtil.cachePut('local', local);
              wx.reLaunch({
                url: 'index'
              })
            } else if (result.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    });
  },
  onShow: function () {
    if (!this.data.city || this.data.city != appInstance.globalData.city){
      var show = {
        street: '位置',
        lease_mode: '出租方式',
        rental_range: '租金',
        house_comefrom: '来源'
      }
      this.setData({ city: appInstance.globalData.city, cityname: appInstance.globalData.cityname, show: show, selected: {}, color: {}, picker_index:'0'});
      this.getSearch();
      this.getHouse();
    }    
  },
  getSearch:function(){
    var that = this;
    appInstance.getConfig(function (config) {
      var congigdata = appInstance.getUtil.copyobj(config);
      var searchConfig = {
        street: congigdata.street,
        lease_mode: congigdata.lease_mode,
        rental_range: congigdata.rental_range,
        house_comefrom: ['来源', "公寓", "个人"]
      };
      searchConfig.street.unshift({ title: '位置' })
      searchConfig.lease_mode.splice(0, 1, '出租方式')
      searchConfig.rental_range.splice(0, 1, {value: '租金' });

      that.setData({ searchConfig: searchConfig });
    });
  },
  getHouse:function(){
    var that = this;
    var data = { 'city': appInstance.globalData.city };
    appInstance.getUtil.apiRequest('5aa75c753326b', 'GET', data, function (res) {
      if (res.data.code == '1') {
        var houseList = res.data.data;
        houseList.forEach(function (val, index, arr) {
          arr[index]['special'] = appInstance.formatSpecial(val.special, 4, val.c_business_key, val.house_comefrom);
        });
        that.setData({ houseList: res.data.data });
      }
    });
  },
  //点击展开下拉选择器
  pickerChange:function(e){
    var searchConfig = this.data.searchConfig;
    var key = e.currentTarget.dataset.key;
    if (key == 'street'){
      var index = parseInt(e.detail.value);

      var selected = this.data.selected;
      var show = this.data.show;
      var color = this.data.color;
      delete selected.area_id;
      delete color.area_id;
      if (index > 0) {
        selected.area_id = searchConfig.street[index].aid;
        color.area_id = index-1;
      }
      this.setData({ selected: selected });
      this.setData({ color: color });
      show.street = searchConfig.street[index].title;
      this.setData({ show: show });
    }
    if (key == 'lease_mode') {
      var index = parseInt(e.detail.value);
      var selected = this.data.selected;
      var color = this.data.color;
      var show = this.data.show;

      selected.lease_mode = index;
      color.lease_mode = index;
      this.setData({ selected: selected });
      this.setData({ color: color });
      show.lease_mode = searchConfig.lease_mode[index];
      this.setData({ show: show });
    }
    if (key == 'rental_range') {
      var index = parseInt(e.detail.value);
      var selected = this.data.selected;
      var color = this.data.color;
      var show = this.data.show;

      delete selected.rent;
      if (index > 0) {
        var min = searchConfig.rental_range[index].min;
        var max = searchConfig.rental_range[index].max;
        selected.rent = min + ',' + max;
      }
      color.rent = index;
      this.setData({ selected: selected });
      this.setData({ color: color });
      show.rental_range = searchConfig.rental_range[index].value;
      this.setData({ show: show });
    }
    if (key == 'house_comefrom') {
      var index = parseInt(e.detail.value);
      var selected = this.data.selected;
      var color = this.data.color;
      var show = this.data.show;

      selected.house_comefrom = index;
      color.house_comefrom = index;

      this.setData({ selected: selected });
      this.setData({ color: color });
      show.house_comefrom = searchConfig.house_comefrom[index];
      this.setData({ show: show});
    }
  }  
})

