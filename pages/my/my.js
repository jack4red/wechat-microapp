//index.js
//获取应用实例
var appInstance = getApp();
Page({
  data: {
    "headImg": "../../img/default-head.png",
    "loginName": "点击登录/注册",
    "isLogin": false,
    "collectionNum": 0,
    "orderNum": 0
  },
  onShow: function () {
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    let userInfo = appInstance.getUtil.cacheGet(cacheKey);
    let that = this;
    if (userInfo) {
      let data = {
        'city': appInstance.globalData.city
      };
      appInstance.getUtil.apiRequest('58d46faac03b6', 'GET', data, function (res) {
        let avatar = res.data.data.avatar || "../../img/default-head.png";
        if (res.data.code == '1') {
          that.setData({
            "collectionNum": res.data.data.collect_count,
            "orderNum": res.data.data.appointment_count,
            "headImg": avatar,
            "loginName": res.data.data.phone,
            "isLogin": true
          })
        }
      });
    }
  },
  checkLogin: function (event) {
    let navUrl = event.currentTarget.dataset.url;

    // 有效代码↓
    if (this.data.isLogin) {
      if (navUrl) {
        wx.navigateTo({
          url: navUrl
        })
      }
    } else {
      wx.navigateTo({
        url: "/pages/login/login"
      })
    }
  },
  logout: function () {
    let that = this;
    wx.showModal({
      title: '退出登录',
      content: '是否确定退出？',
      confirmColor: "#ffa229",
      success: function (res) {
        if (res.confirm) {
          var data = { 'city': appInstance.globalData.city };
          appInstance.getUtil.apiRequest('58cf73180ed51', 'GET', data, function (res) {
            if (res.data.code == '1') {
              var cacheKey = appInstance.getUtil.getUserinfoKey();
              appInstance.getUtil.cacheRemove(cacheKey);
              wx.login({
                success: function (res) {
                  if (res.code) {
                    appInstance.getUtil.cachePut('code', res.code);
                  }
                }
              });
              that.setData({
                "headImg": "../../img/default-head.png",
                "loginName": "点击登录/注册",
                "isLogin": false
              });
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})
