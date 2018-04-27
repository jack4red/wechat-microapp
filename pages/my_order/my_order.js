// pages/my_order/my_order.js
var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "tabs":["active",""],
    "panels":["active",""],
    "currentOrder": false,
    "historyOrder": false,
    "nowpage": 1,
    "currentType":1,
    "city":''
  },

  tabtap:function(event){
    if (event.currentTarget.dataset.index == 0){
      this.setData({
        "tabs": ["active", ""],
        "panels": ["active", ""],
        "currentOrder": false,
        "historyOrder": false,
        "nowpage": 1,
        "currentType": 1
      })
      this.fetchTabData(1);
    }else{
      this.setData({
        "tabs": ["", "active"],
        "panels": ["", "active"],
        "currentOrder": false,
        "historyOrder": false,
        "nowpage": 1,
        "currentType": 0
      })
      this.fetchTabData(0);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ 'city': appInstance.globalData.city})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.fetchTabData(1);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * type
   * 1:当前预约
   * 0:历史预约
   */
  fetchTabData:function(type){
    let that = this;
    let data = {
      'city': appInstance.globalData.city,
      'now': type,
      'page': that.data.nowpage,
      'per_page': 4
    };
    appInstance.getUtil.apiRequest('58d0da997723e', 'GET', data, function (res) {
      if (res.data.code == '1') {
        for (let i = 0; i < res.data.data.length;i++){
          let time_range = appInstance.globalData.config.look_house_time[parseInt(res.data.data[i].plan_look_time)];
          let day = new Date(res.data.data[i].plan_look_date).getDay();
          console.log(res.data.data[i].plan_look_date, day, time_range)
          let week = ['日','一','二','三','四','五','六'];
          res.data.data[i].order_time = res.data.data[i].plan_look_date + ' 周' + week[day] + time_range;
          res.data.data[i].special = appInstance.formatSpecial(res.data.data[i].special, 4, res.data.data[i].c_business_key, res.data.data[i].house_comefrom);
        }
        if(type == 1){
          let temp = that.data.currentOrder || [];
          let currentOrder = temp.concat(res.data.data);
          that.setData({
            "currentOrder": currentOrder
          })
        }else{
          let temp = that.data.historyOrder || [];
          let historyOrder = temp.concat(res.data.data);
          that.setData({
            "historyOrder": historyOrder
          })
        }
      }
    });
  },

  cancelOrder:function(event){
    let that = this;
    let id = event.currentTarget.dataset.id;
    let index = event.currentTarget.dataset.index;
    let data = {
      'city': appInstance.globalData.city,
      'appointment_id':id
    };

    wx.showModal({
      title: '取消预约',
      confirmColor: "#ffa229",
      content: '确定取消本次预约吗？',
      success: function (res) {
        if (res.confirm) {
          appInstance.getUtil.apiRequest('58d07d87a581f', 'POST', data, function (res) {
            if (res.data.code == '1') {
              let temp = that.data.currentOrder;
              temp[index].status = '3';
              that.setData({
                "currentOrder": temp
              })
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });

    
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var nowpage = that.data.nowpage;
    nowpage += 1;
    console.log(nowpage)
    that.setData({
      nowpage: nowpage
    })
    that.fetchTabData(that.data.currentType)//渲染列表数据
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})