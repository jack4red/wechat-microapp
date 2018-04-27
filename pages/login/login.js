var appInstance = getApp();
Page({
  data: {
    phone:'',
    code:'',
    codename:'获取验证码',
    codedisable:false
  },
  //事件处理函数
  onLoad: function () {
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    appInstance.getUtil.cacheRemove(cacheKey);
  },
  inputPhone: function(e){
    this.setData({'phone':e.detail.value});
  },
  inputCode: function (e) {
    this.setData({ 'code': e.detail.value });
  },
  codeSuccess: function(){
    this.codedisable = true;
    var that = this;
    var i = 61;
    var timer = setInterval(function () {
      i -= 1;
      if (i < 1) {
        that.setData({ 'codename': '重新获取' }); 
        that.codedisable = false;
        clearInterval(timer);
      }else{
        that.setData({ 'codename': i + 's' });
      }
    }, 1000);
  },  
  getCode: function (e) {
    if (this.codedisable) return false;
    var that = this;
    var data = {
      'city': appInstance.globalData.city,
      'phone': this.data.phone,
      'comefrom': 1,
      'type': 1
    };
    appInstance.getUtil.apiRequest('58ccb9b1df240', 'GET', data, function (res) {
      if (res.data.code == '1') {
        wx.showToast({
          title: '验证码已发送，请注意查收',
          icon: 'none',
          duration: 3000,
          success:function(){
            that.codeSuccess();
          }
        })
      }else{
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 3000
        })
      }
    },1,1);
  },
  passportLogin: function () {
    var data = {
      'city': appInstance.globalData.city,
      'phone': this.data.phone,
      'code': this.data.code
    };
    appInstance.getUtil.apiRequest('58cba5c50272c', 'GET', data, function (res) {
      if (res.data.code == '1') {
          var userinfo = {
            passport_phone: res.data.data.passport_phone,
            passport_uid: res.data.data.passport_uid,
            passport_username: res.data.data.passport_username,
            sso_token: res.data.data.sso_token
          }
          var cacheKey = appInstance.getUtil.getUserinfoKey();
          appInstance.getUtil.cachePut(cacheKey, userinfo);
          wx.showToast({
            title: '登录成功',
            icon: 'none',
            duration: 3000,
            success:function(){
              wx.navigateBack({ delta: 1 });
            }
          })
      } else if (res.data.code == '-12') {
        wx.showToast({
          title: '请输入验证码',
          icon: 'none',
          duration: 3000
        })
      } else if (res.data.code == '-11') {
        wx.showToast({
          title: '请输入正确的验证码',
          icon: 'none',
          duration: 3000
        })
      }else if (res.data.code == '-1'){        
        wx.showToast({
          title: '验证码错误，请重新输入',
          icon: 'none',
          duration: 3000
        })
      }else{
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 3000
        })
      }
    },1,1);
  },
  getPhoneNumber: function (e) {
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      var code = appInstance.getUtil.cacheGet('code');
      var data = {
        'city': appInstance.globalData.city,
        'code': code,
        'iv': e.detail.iv,
        'encryptedData': e.detail.encryptedData,
      };
      appInstance.getUtil.apiRequest('5aa1f93704a0f', 'POST', data, function (res) {
        if (res.data.code == '1') {
          var userinfo = {
            passport_phone: res.data.data.passport_phone,
            passport_uid: res.data.data.passport_uid,
            passport_username: res.data.data.passport_username,
            sso_token: res.data.data.sso_token
          }
          var cacheKey = appInstance.getUtil.getUserinfoKey();
          appInstance.getUtil.cachePut(cacheKey, userinfo);
          wx.navigateBack({ delta: 1 });
        }else{
          wx.showToast({
            title: '请求失败，请重试',
            icon: 'none',
            duration: 3000,
            success: function(){
              wx.login({
                success: function (res) {
                  if (res.code) {
                    appInstance.getUtil.cachePut('code', res.code);
                  }
                }
              });
            }
          })
        }
      },1,1);
    }
  } 
})