var appInstance = getApp();
var distance = 0;
var scale = 1;
Page({
  data:{
    carouselPageIndex:0,//轮播当前页序号
    carouselPageImages:[],//轮播页面数据
    scaleValue:1
  },
  swiperChange:function(e){//轮播图片
    wx.setNavigationBarTitle({
      title: e.detail.current + 1 + '/' + wx.getStorageSync('imgUrls').length
    })
  },
  onScale:function(e){
    scale = e.detail.scale;
  },
  touchstart:function(e){
    if (e.touches.length >= 2) {
      distance =this. _distance(e.touches);
    }
  },
  touchmove:function(e){
    if (e.touches.length >= 2){
      if (this._distance(e.touches) < distance){
        if (scale > 1){
          this.setData({ scaleValue:1});
        }
      }
    }
  },
  _distance:function(data){
    var x = Math.abs(data[0].pageX - data[1].pageX);
    var y = Math.abs(data[0].pageY - data[1].pageY);
    return  Math.sqrt(x * x + y * y);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onLoad: function () {
    this.setData({carouselPageIndex:wx.getStorageSync('carouselPageIndex')});
    this.setData({ carouselPageImages: wx.getStorageSync('imgUrls')});
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('carouselPageIndex') + 1 + '/' + wx.getStorageSync('imgUrls').length
    })
  },
});