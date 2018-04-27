var appInstance = getApp();
Page({
  data: {
    count:0,//输入框文字计数
    images:[],//上传的图片
    reason:[{id:1,reason:'房源已出租'},{id:2,reason:'房东是中介'},{id:3,reason:'房屋信息虚假'},{id:4,reason:'其它'}],
    reasonTxt:'请选择举报理由',
    more_txt:'',//更多补充信息
    r_reason:'',
    reportInfo:{},
    canSubmit:'false'//是否能提交
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.rander();
  },
  rander: function () {
    this.setData({ reportInfo: wx.getStorageSync('report') });
  },
  checkNum:function(event){//监控textarea输入文字数目函数
    this.setData({ count: event.detail.value.length});
    this.data.more_txt = event.detail.value;
    if (this.data.reasonTxt != '请选择举报理由' && event.detail.value.length > 0) {
      this.setData({ canSubmit: '' });
    } else {
      this.setData({ canSubmit: 'false' });
    }
  },
  uploadImg:function(){//上传图片
    var that = this;
    wx.chooseImage({
      count: 3 - that.data.images.length, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        tempFilePaths.forEach(function (val, index, arr) {
          appInstance.getUtil.apiUpload(appInstance.globalData.city,val,'',function(res){
            console.log(res)
            var data = JSON.parse(res.data);//后台莫名其妙返回的字符串数据，只能在此转一下
            if (data.code == 1){
              that.data.images.push(data.data.imgurl);
              that.setData({ images: that.data.images});
            }
          });
        })
      }
    })
  },
  deleteImg:function(event){//删除上传图片
    var index = event.currentTarget.dataset.index;
    var arr = this.data.images;
    arr.splice(parseInt(index),1);
    this.setData({ images:arr});
  },
  formSubmit: function (e) {//表单提交
    var imgs = this.data.images.join(',');
    this.data.reportInfo.imgs = imgs;
    this.data.reportInfo.r_reason = this.data.r_reason;
    this.data.reportInfo.r_detail = this.data.more_txt;
    appInstance.getUtil.apiRequest('58d248d290a6d', 'GET', this.data.reportInfo, function (res) {
      if (res.data.code == 1) {
        wx.showToast({
          title: '举报成功',
          icon: 'none',
          duration:3000
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
  selectReason:function(e){//选择举报理由
    this.setData({reasonTxt:this.data.reason[e.detail.value].reason});
    this.data.r_reason = this.data.reason[e.detail.value].id;
    if (this.data.more_txt != ''){
      this.setData({canSubmit:''});
    }
  },
})