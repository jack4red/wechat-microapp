// pages/my_collection.js
var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    "houses": false,
    "nowpage": 1,
    "city":''
  },
  touch: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ 'city': appInstance.globalData.city })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.fetchData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  fetchData: function () {
    let that = this;
    let data = {
      'city': appInstance.globalData.city,
      'page': that.data.nowpage,
      'per_page': 10
    };
    appInstance.getUtil.apiRequest('58d109ae3082b', 'GET', data, function (res) {
      if (res.data.code == '1') {
        let houseList = res.data.data;
        houseList.forEach(function (val, index, arr) {
          arr[index]['special'] = appInstance.formatSpecial(val.special, 4, val.c_business_key, val.house_comefrom);
        });
        let temp = that.data.houses || [];
        houseList = temp.concat(houseList);
        that.setData({
          "houses": houseList
        })
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
    that.fetchData()//渲染列表数据
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 触摸开始事件 
  touchStart: function (e) {
    let that = this;
    that.touch.time = 0;
    that.touch.touchDot = e.touches[0].pageX; // 获取触摸时的原点 
    // 使用js计时器记录时间  
    that.touch.interval = setInterval(function () {
      that.touch.time++;
    }, 100);
  },
  // 触摸移动事件 
  touchMove: function (e) {
    let that = this;
    that.touch.touchMove = e.touches[0].pageX;
    // console.log("touchMove:" + that.touch.touchMove + " touchDot:" + that.touch.touchDot + " diff:" + (that.touch.touchMove - that.touch.touchDot));
    // 向左滑动  
    if (that.touch.touchMove - that.touch.touchDot <= -40 && that.touch.time < 10) {
      console.log(e.currentTarget.dataset.index);
      let temp = that.data.houses;
      temp[e.currentTarget.dataset.index].isDelete = "-177rpx";
      that.setData({
        "houses": temp
      })
    }
    // 向右滑动 
    if (that.touch.touchMove - that.touch.touchDot >= 40 && that.touch.time < 10) {
      console.log(e.currentTarget.dataset.index);
      let temp = that.data.houses;
      temp[e.currentTarget.dataset.index].isDelete = "0";
      that.setData({
        "houses": temp
      })
    }
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    let that = this;
    clearInterval(that.touch.interval); // 清除setInterval 
    that.touch.time = 0;
  },
  deleteBtn: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let temp = that.data.houses;
    let data = {
      'city': appInstance.globalData.city,
      'house_comefrom': temp[index].house_comefrom,
      'h_id': temp[index].h_id,
      'r_id': temp[index].r_id ? temp[index].r_id : 0,
      'c_id': temp[index].c_id ? temp[index].c_id : 0,
      'collect_status': temp[index].collect_status == 0 ? 1 : 0,
    };
    wx.showModal({
      title: '删除',
      confirmColor: "#ffa229",
      content: '是否确定删除？',
      success: function (res) {
        if (res.confirm) {
          appInstance.getUtil.apiRequest('58d271498fa6d', 'POST', data, function (res) {
            if (res.data.code == '1') {
              temp.splice(index,1);
              console.log(temp);
              that.setData({
                "houses": temp
              })
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})