// pages/my_coupon/my_coupon.js
var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "tabs": ["active", "", ""],
    "panels": ["active", "", ""],
    "coupons":[
      false,
      false,
      false
    ]
  },

  tabtap: function (event) {
    if (event.currentTarget.dataset.index == 0) {
      this.setData({
        "tabs": ["active", "", ""],
        "panels": ["active", "", ""],
        "coupons": [
          false,
          false,
          false
        ]
      });
      this.fetchTabData(1);
    } else if (event.currentTarget.dataset.index == 1) {
      this.setData({
        "tabs": ["", "active", ""],
        "panels": ["", "active", ""],
        "coupons": [
          false,
          false,
          false
        ]
      });
      this.fetchTabData(2);
    } else{
      this.setData({
        "tabs": ["", "", "active"],
        "panels": ["", "", "active"],
        "coupons": [
          false,
          false,
          false
        ]
      });
      this.fetchTabData(3);
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
   * 1:未使用
   * 2:已使用
   * 3:已过期
   */
  fetchTabData: function (type) {
    let that = this;
    let data = {
      'city': appInstance.globalData.city,
      'cdkey_status': type
    };
    appInstance.getUtil.apiRequest('58d271b4aafb9', 'GET', data, function (res) {
      if (res.data.code == '1') {
        let temp = that.data.coupons;
        temp[type -1] = res.data.data;
        that.setData({
          "coupons":temp
        })
      }
    });
  },

  toggleActive:function(event){
    let temp = this.data.coupons;
    let i = event.currentTarget.dataset.i;
    let index = event.currentTarget.dataset.index;
    let tempStatus = temp[i][index].isActive;
    temp[i][index].isActive = !tempStatus;
    if (temp[i][index].card_description.split){
      temp[i][index].card_description = temp[i][index].card_description.split("\n");
    }
    this.setData({
      "coupons": temp
    })
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})