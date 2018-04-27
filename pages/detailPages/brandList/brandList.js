var appInstance = getApp();
Page({
  data:{
    companyInfo:{},
    isShowAll:true,//展示公寓全部描述
    isShowArrow:true,//是否展示箭头
    show:false,//最终展示文字效果
    houseList:[],//房源展示列表数据
    orientation: [],//朝向
    t:''//区分是否集中式的字段前缀
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.loadData();//加载数据 
  },
  loadData:function(){
    var that = this;
    var data = wx.getStorageSync('companyInfo');
    var t = data.l_id ? 'l_' : 'r_';
    this.setData({t:t});
    this.resetData(data);
    this.setData({ companyInfo: data},function(){
      that.getViewInfo();
    });
    console.log(this.data.companyInfo)
  },
  getViewInfo: function () {
    var that = this;
    wx.createSelectorQuery().select('#view').boundingClientRect(function (rect) {
      rect.height  // 节点的高度
      if (rect.height <= 45) {
        that.setData({ isShowArrow: false });
      } else {
        that.setData({ isShowAll: false });
      }
      that.setData({ show: true });
    }).exec()
  },
  resetData:function(data){//重组数据
    if (Object.prototype.toString.call(data.data) != '[object Array]'){
      return;
    }
    this.setData({ orientation: appInstance.globalData.config.orientation });//朝向
    for(var i = 0 ; i < data.data.length ; i ++){
      data.data[i].houseSpecial = 
        this.checkData(data.data[i][this.data.t + 'special'], appInstance.globalData.config.special, data.data[i]);//查找特色；
      data.data[i].imgUrls = data.data[i][data.l_id ? 'l_list_images' : 'detail_images'].split(',')[0];//重组图片数据
    }
    this.setData({ houseList: data.data.slice(0,10)});
  },
  checkData: function (data, info,mes) {//查找数据
    var arr = [];
    if (data) {
      for (var i = 0; i < info.length; i++) {
        if (data.indexOf(info[i].key.toString()) > -1) {
          arr.push(info[i]);
        }
      }
    }
    if (mes.c_business_key == 999) {
      var o = {};
      o.key = 999;
      o.value = '爱租月付';
      arr.unshift(o);
    }
    if (mes.house_comefrom == 1) {
      var obj = {};
      obj.key = 0;
      obj.value = '公寓';
      arr.unshift(obj);
    }
    return arr.slice(0, 4);
  },
  showAll:function(){//展示全部描述
    this.setData({isShowAll:!this.data.isShowAll});
  },
  checkMoreHouse:function(){//查看更多房源
    wx.navigateTo({
      url: '/pages/list/list?c_id=' + this.data.companyInfo.c_id + '&companyid=' + this.data.companyInfo.companyid
    });
  },
  checkhouse:function(event){//查看房源信息
    wx.navigateTo({
      url: '/pages/detailPages/detailPages?l_id=' + event.currentTarget.dataset.l_id + '&h_id=' 
      + event.currentTarget.dataset.h_id + '&house_comefrom=' + event.currentTarget.dataset.house_comefrom 
      + '&' + this.data.t + 'id=' + event.currentTarget.dataset[this.data.t + 'id']
    });
  }
});