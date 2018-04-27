Page({
  data:{
    markers: []
  },
  onLoad: function (options) {
    this.showMap();//显示地图
  },
  showMap:function(){
    this.setData({ markers: wx.getStorageSync('markers')});
  },
  gohere:function(){//导航
    wx.openLocation({
      latitude: this.data.markers[0].latitude,
      longitude: this.data.markers[0].longitude,
      scale: 14,
      success: function (e) {
        console.log(e)
      }
    })
  }
});