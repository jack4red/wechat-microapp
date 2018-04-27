var appInstance = getApp();
Page({
  data:{
    houseInfo:{},//房源信息
    multiArray: [],
    time:'请选择',
    canSubmit:'false',//能否提交
    phone:'',
    dateValue:'',
    timeValue:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.loadData();//加载数据
    this.setDate();//设置时间数组
  },
  loadData: function () {//组装房源信息数据
    var cacheKey = appInstance.getUtil.getUserinfoKey();
    var data = appInstance.getUtil.cacheGet(cacheKey);
    this.setData({ phone: data.passport_phone});
    this.setData({ houseInfo: wx.getStorageSync('houseInfo')});
  },
  setDate:function(){//组装时间数组
    var now = + new Date();
    var oneDay = 86400000;
    var week = ['日', '一', '二', '三', '四', '五', '六'];
    var dateArr = [];

    var len = appInstance.globalData.config.look_house_date ? appInstance.globalData.config.look_house_date: 14;
    for (var i = 0, time; i < len; i ++){
      time = now + oneDay * i;
      var Y = new Date(time).getFullYear();
      var M = new Date(time).getMonth() + 1;//获得月份
      var D = new Date(time).getDate();//获得天数
      var W = week[new Date(time).getDay()];//获得周几 
      var obj = {};
      var str = M + '月' + D + '日' + '(周' + W + ')';
      var id = Y + '-' + (M.toString().length === 1 ? ('0' + M) : M) + '-' + (D.toString().length === 1 ? ('0' + D) : D);
      obj.value = str;
      obj.id = id;
      dateArr.push(obj); 
    }
    this.setData({ multiArray: [dateArr, [{id:0,value:'全天'}, {id:1,value:'上午(8:00-12:00)'},
       {id:2,value:'中午(12:00-14:00)'}, {id:3,value:'下午(14:00-18:00)'},{id:4,value: '晚上(18:00-21:00)'}]]});
  },
  bindMultiPickerChange:function(e){
    console.log(e)
    if (e.type === 'change'){
      this.setData({ time: this.data.multiArray[0][e.detail.value[0]].value + this.data.multiArray[1][e.detail.value[1]].value});
      this.data.timeValue = this.data.multiArray[1][e.detail.value[1]].id;
      this.data.dateValue = this.data.multiArray[0][e.detail.value[0]].id;
    }
    this.canSubmit();
  },
  formSubmit:function(e){//提交预约
    var obj = {};
    obj.city = this.data.houseInfo.city;
    obj.plan_look_date = this.data.dateValue;
    obj.plan_look_time = this.data.timeValue;
    obj.h_id = this.data.houseInfo.h_id;
    obj.telephone = this.data.phone;
    obj.r_id = this.data.houseInfo.r_id;
    console.log(obj)
    appInstance.getUtil.apiRequest('58ccde864b3b7', 'POST', obj, function (res) {
      if (res.data.code == 1) {
        wx.showToast({
          title: '预约信息已提交',
          icon: 'none',
          duration: 3000,
          success:function(){
            setTimeout(function(){
              wx.navigateBack({
                delta: 1
              })
            },3000);
          }
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 3000
        })
      }
    },0,1);
  },
  phone:function(e){
    this.setData({phone:e.detail.value});
    this.canSubmit();
  },
  canSubmit:function(){
    if (this.data.phone && this.data.phone.length == 11 && this.data.time != '请选择') {
      this.setData({ canSubmit: '' });
    } else {
      this.setData({ canSubmit: 'false' });
    }
  }
});