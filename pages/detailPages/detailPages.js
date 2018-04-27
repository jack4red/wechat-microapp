// pages/detailpages/detailpages.js
var appInstance = getApp();
var obj = {};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    url:'',
    markers: [{
      iconPath: "/img/position-market.png",
      id: 0,
      latitude: 0,
      longitude: 0,
      width: 25,
      height: 34,
    }],
    imgUrls:[],
    indicatorDots:false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    imgsNum:0,//轮播图总量
    current:1,//当前页
    isShowHouseDescription:true,//是否展示房源描述
    isShowArrow:true,//是否展示箭头
    isShowRule:false,//是否展示优惠券规则
    isShowCoupon:false,//是否展示优惠券
    houseInfo:{},//房源信息
    companyInfo:{},//品牌公寓信息
    card_index:0,//优惠券下标
    card_start:0,//有效期开始时间
    card_end:0,//有效期结束时间
    house_comefrom:'',//房源（个人2，公寓1）
    orientation:[],//朝向
    loadOver:false,
    options:{}
  },
  swiperChange: function (e) {
    this.setData({ current: e.detail.current + 1});
  },
  onShareAppMessage: function (res) {
    var title = this.data.houseInfo.house_title;
    if (this.data.houseInfo.room && this.data.houseInfo.room > 0){
      title += ' ';
      title += this.data.houseInfo.room + '室';
      if (this.data.houseInfo.hall && this.data.houseInfo.hall > 0) {
        title += this.data.houseInfo.hall + '厅';
      }
    }
    var path = '/pages/detailPages/detailPages?h_id=' + this.data.houseInfo.h_id + '&r_id=' + this.data.houseInfo.r_id + '&house_comefrom=' + this.data.houseInfo.house_comefrom + '&l_id=' + this.data.houseInfo.l_id + '&city=' + appInstance.globalData.city;
    return appInstance.getShareReturn(title, path);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({options:options});
    this.loadData(options);//加载数据 
  },
  loadData: function (options){//加载数据
    var that = this;
    options.city = appInstance.globalData.city;
    obj = options;
    this.setData({ house_comefrom: options.house_comefrom});
    this.setData({ orientation: appInstance.globalData.config.orientation});
    var uid = '';
    if (+options.l_id){//集中式公寓
      uid = '599a43979f8e0';
    } else if (options.house_comefrom == 1){//是公寓房源
      uid = '58ccbeb90c4d4';
    } else { //个人房源
      uid = '58ccbf0313fdf';
    }
    appInstance.getUtil.apiRequest(uid, 'GET', options, function (res) {
      if (res.data.code == 1){
        obj.r_id = options.r_id = res.data.data.r_id;
        obj.h_id = options.h_id = res.data.data.h_id;
        obj.l_id = options.l_id = res.data.data.l_id;
        that.resetTime(res.data.data);//更新时间
        var array = that.checkData(res.data.data.r_special,appInstance.globalData.config.special);//查找特色；
        res.data.data.houseSpecial = that.showIcon(array, res.data.data)//可以展示的标签
        res.data.data.orientation = appInstance.globalData.config.orientation[res.data.data.orientation_id];//朝向
        res.data.data.facilitiesNow = that.checkData(res.data.data.facilities, appInstance.globalData.config.room_facilities);//设施
        res.data.data.payType = appInstance.globalData.config.contract_pay_type[res.data.data.h_pay_type];//付款方式
        res.data.data.renovation = appInstance.globalData.config.renovation[res.data.data.renovation_id];//装修
        var arr = res.data.data.r_detail_images.split(',');
        that.setData({ imgsNum: arr.length });//定义轮播图数量
        that.setData({ imgUrls: arr });//定义轮播图数据
        that.map(res.data.data);//注入地图信息
        res.data.data.imgUrls = arr;
        res.data.data.city = appInstance.globalData.city;
        that.setData({ houseInfo: res.data.data },function(){
          that.getViewInfo();
        });
        if (res.data.data.c_id > 0){
          that.getFeatureApartment(options);//查阅品牌公寓信息
        } else {
          wx.hideLoading();
        }
      } else {
        console.log(res.data.msg);
      }
    }, 0,1);
  },
  getViewInfo:function(){
    var that = this;
    wx.createSelectorQuery().select('#view').boundingClientRect(function (rect) {
      rect.height  // 节点的高度
      if(rect.height <= 45){
        that.setData({ isShowArrow:false});
      } else {
        that.setData({ isShowHouseDescription: false });
      }
    }).exec()
  },
  showIcon:function(arr,data){//可以展示的标签
    var a = [];
    var obj = {};
    obj.key = 0;
    if (data.house_comefrom == 1){
      obj.value = '公寓';
    } else if (data.house_comefrom == 2){
      obj.value = '个人好房';
    }
    a.push(obj);
    if (data.c_business == '爱租月付'){
      var o = {};
      o.key = 999;
      o.value = '爱租月付';
      a.push(o);
    }
    if (arr){
      a = a.concat(arr);
    }
    return data.house_comefrom == 1 ? a.slice(0, 4) : a.slice(0, 1);
  },
  getFeatureApartment: function (options){//查阅品牌公寓信息
    var that = this;
    options.c_id = that.data.houseInfo.c_id;
    options.perpage = 11;
    appInstance.getUtil.apiRequest(this.data.houseInfo.l_id ? '599d39557b33a' : '595cbf0605e3b', 'GET', options, function (res) {
      if (res.data.code == 1) {
        that.setData({companyInfo:res.data.data});   
      } else {
        console.log(res.data.msg);
      }
      wx.hideLoading();
    },0,1);
  },
  map:function(data){//地图信息
    var that = this;
    this.data.markers[0].latitude = data.lat;
    this.data.markers[0].longitude = data.lng;
    this.setData({ markers: this.data.markers});
  },
  checkData: function (data,info) {//查找数据
    if (data) {
      var arr = [];
      for (var i = 0; i < info.length; i++) {
        if (data.indexOf(info[i].key.toString()) > -1) {
          arr.push(info[i]);
        }
      }
    }
    return arr;
  },
  resetTime:function(data){//更新时间
    if (data.edit_time){
      var oldTime = data.edit_time * 1000;
      var now = +new Date();
      var eTime = now - oldTime;
      var y = 365 * 24 * 60 * 60 * 1000;
      var m = 30 * 24 * 60 * 60 * 1000;
      var d = 24 * 60 * 60 * 1000;
      var h = 60 * 60 * 1000;
      var mi = 60 * 1000;
      if (eTime > y){
        var time = parseInt(eTime / y) + '年前更新';
      } else if (eTime > m){
        var time = parseInt(eTime / m) + '月前更新';
      } else if (eTime > d) {
        var time = parseInt(eTime / d) + '天前更新';
      } else if (eTime > h) {
        var time = parseInt(eTime / h) + '小时前更新';
      } else if (eTime > mi) {
        var theT = parseInt(eTime / mi);
        if (theT == 0){
          theT = 1;
        }
        var time = theT + '分钟前更新';
      }
      data.edit_time = time;
    }
  },
  keep:function(event){//收藏事件函数
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data) {
      obj.collect_status = this.data.houseInfo.hasCollected;//0 收藏 1取消收藏
      this.data.houseInfo.hasCollected = this.data.houseInfo.hasCollected ? 0 : 1;//0未收藏 1已收藏
      obj.house_comefrom = this.data.houseInfo.house_comefrom;
      var that = this;
      appInstance.getUtil.apiRequest('58d271498fa6d', 'POST', obj, function (res) {
        if (res.data.code == 1) {
          that.setData({ houseInfo: that.data.houseInfo });
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      },1);
    } else {
      wx.navigateTo({
        url: '../login/login'
      });
    }
  },
  showAll:function(event){//展示所有文字
    if (this.data.isShowHouseDescription) {
      this.setData({ isShowHouseDescription: false });
    } else {
      this.setData({ isShowHouseDescription: true });
    }
  },
  checkLgImg:function(event){//查看大图
    var that = this;
    var carouselPageIndex = that.data.current - 1;
    wx.setStorageSync('carouselPageIndex', carouselPageIndex);
    wx.setStorageSync('imgUrls', that.data.imgUrls);
    wx.navigateTo({
      url: 'lgImg/lgImg',
    })
  },
  position:function(event){//查看位置
    this.data.markers[0].adr = this.data.houseInfo.xdistrict_name + this.data.houseInfo.xstreet_name + this.data.houseInfo.xaddress;
    wx.setStorageSync('markers', this.data.markers);
    wx.navigateTo({
      url: 'position/position',
    });
  },
  report:function(){//转跳到举报页面
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data){
      var obj = {};
      obj.city = this.data.houseInfo.city;
      obj.phone = data.passport_phone;
      obj.h_id = this.data.houseInfo.h_id;
      obj.r_id = this.data.houseInfo.r_id;
      obj.passport_username = data.passport_username;
      obj.passport_uid = data.passport_uid;
      obj.from = appInstance.globalData.from;
      obj.house_comefrom = this.data.houseInfo.house_comefrom;
      wx.setStorageSync('report', obj);
      wx.navigateTo({
        url: 'report/report'
      });
    } else {
      wx.navigateTo({
        url: '../login/login'
      });
    }
  },
  viewHouse: function (event) {//预约看房
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data){
      wx.setStorageSync('houseInfo', this.data.houseInfo);
      wx.navigateTo({
        url: 'viewHouse/viewHouse'
      });
    } else {
      wx.navigateTo({
        url: '../login/login'
      })
    }
  },
  isShowRule:function(){//展示优惠券规则
    this.setData({isShowRule:!this.data.isShowRule});
  },
  close:function(event){//关闭优惠券弹窗
    this.setData({ isShowCoupon: !this.data.isShowCoupon });
    if (this.data.isShowCoupon){
      this.setData({card_index:event.currentTarget.dataset.index});
      this.resetTimeStyle(this.data.houseInfo.cardList[event.currentTarget.dataset.index]);
    }
  },
  resetTimeStyle:function(data){//重置时间格式
    this.setData({ card_start: this.resetTimer(parseInt(data.card_keyStart))});
    this.setData({ card_end: this.resetTimer(parseInt(data.card_keyEnd)) });
  },
  resetTimer:function(t){
    t *= 1000;
    var sy = new Date(t).getFullYear();
    var sm = new Date(t).getMonth() + 1;
    var sd = new Date(t).getDate();
    return sy + '-' + sm + '-' + sd;
  },
  getCard: function () {//领取优惠券
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    if (data) {
      var that = this;
      var obj = {};
      obj.city = this.data.houseInfo.city;
      obj.card_id = this.data.houseInfo.cardList[this.data.card_index].card_id;
      obj.c_id = this.data.houseInfo.c_id;
      obj.cdkey_from = appInstance.globalData.from;
      appInstance.getUtil.apiRequest('58d272361fb78', 'POST', obj, function (res) {
        if (res.data.code == 1) {
          that.data.houseInfo.cardList[that.data.card_index].hasActived = 1;
          that.setData({ houseInfo: that.data.houseInfo });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          
        }
      });
    } else {
      wx.navigateTo({
        url: '../login/login'
      });
    }
  },
  checkHouse:function(event){//房间信息查看未出租的房间
    wx.navigateTo({
      url: '/pages/detailPages/detailPages?' 
      + event.currentTarget.dataset.key + '=' + event.currentTarget.dataset.id + '&h_id=' + obj.h_id + '&city='
      + obj.city + '&house_comefrom=' + this.data.houseInfo.house_comefrom
    });
  },
  closeImg:function(event){//关闭爱租月付图片
    this.setData({ isShowPay:false});
   
  },
  checkmore:function(){//查看更多房源
    wx.navigateTo({
      url: '/pages/list/list?fromdetail=1&xiaoqu_id=' + this.data.houseInfo.xiaoqu_id + '&xname=' + this.data.houseInfo.xname
    });
  },
  checkMoreHouse:function(){//查看更多品牌房源
    this.data.companyInfo.l_id = this.data.houseInfo.l_id;
    this.data.companyInfo.c_id = this.data.houseInfo.c_id;
    wx.setStorageSync('companyInfo', this.data.companyInfo);
    wx.navigateTo({
      url: '/pages/detailPages/brandList/brandList'
    });
  },
  call:function(){//拨打房东电话
    var that = this;
    if (this.data.houseInfo.house_comefrom == 2){      
      var cacheKey = appInstance.getUtil.getUserinfoKey();
      var data = appInstance.getUtil.cacheGet(cacheKey);
      if (data) {
        wx.makePhoneCall({
          phoneNumber: this.data.houseInfo.phone,
          success:function(){
            var data = { 'city': that.data.houseInfo.city};
            appInstance.getUtil.apiRequest('5acd72105bef3', 'POST', data, function (res) {});
          }
        })
      } else {
        wx.navigateTo({
          url: '../login/login'
        });
      }
    } else {
      wx.makePhoneCall({
        phoneNumber: this.data.houseInfo.phone,
        success: function () {
          var data = { 'city': that.data.houseInfo.city };
          data.phone_400 = that.data.houseInfo.phone;
          data.house_id = that.data.houseInfo.h_id;
          data.room_id = that.data.houseInfo.r_id;
          data.house_comefrom = that.data.houseInfo.house_comefrom;
          data.sem_referer = 'aznwx';
          data.sem_keyword = 'aznwx';
          appInstance.getUtil.apiRequest('5a7d37f752d28', 'POST', data, function (res) {});          
        }
      })
    }
  },
  loadOver:function(){//加载结束
    this.setData({ loadOver:true});
  },
  mPay:function(){//转跳至爱租月付介绍页
    wx.navigateTo({
      url: 'm_pay/m_pay'
    });
  }
})