var appInstance = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    search_result_show:false,//是否显示模糊搜索内容 当前状态
    lists:{},//模糊搜索内容数据
    inputvalue:'',
    showclearinput: false,
    hotkeywords:{},
    historyWord:[],
    isShowHistoryWord:true,
    keyword:'',
    show:{
      search:false,
      quyu:false,
      ditie:false,
      xiaoqu:false
    }
  },

  //清空历史搜索内容
  enptyHistory:function(){
    var that = this;
    var cacheKey = 'historyword_' + appInstance.globalData.city;
    appInstance.getUtil.cacheRemove(cacheKey);
    that.setData({ historyWord: [], isShowHistoryWord:false})
  },
  //清空输入框内容
  clearinput: function () {
    this.setData({ keyword: '', search_result_show: false, showclearinput:false })
  },
  search: function (keyword){
      this.setData({
        search_result_show: true,
        keyword: keyword,
        showclearinput: true
      })
      var that = this;
      var data = { 'city': appInstance.globalData.city, 'keyword': keyword };
      appInstance.getUtil.apiRequest('59fc0c9772eab', 'GET', data, function (res) {
        if (res.data.code == '1') {
          var temp = res.data.data;
          var lists = {
            quyu: [],
            ditie: [],
            xiaoqu: []
          }
          for (var i in temp) {
            if (temp[i].type == 2) {
              lists.xiaoqu.push(temp[i])
            } else if (temp[i].type == 4) {
              lists.ditie.push(temp[i])
            } else if (temp[i].type == 6) {
              lists.quyu.push(temp[i])
            }
          }

          that.setData({
            lists: lists
          })
        }
      });
  },
  //热门搜索
  hotSearchInput: function (e) {
    var keyword = e.currentTarget.dataset.value;
    this.search(keyword);
  },
  //历史搜索
  hisSearchInput: function (e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      reload: true,
      itemname: e.currentTarget.dataset.value,
      keywords: '',
      xiaoqu_id: '',
      ss_id: '',
      plate_id: ''
    })
    wx.navigateBack();
  },
  //点击输入框搜索按钮
  confirm_input:function(e){
    var keyword = e.detail.value;
    if (keyword == '') {
      this.setData({ 
        search_result_show: false, 
        keyword: '', 
        showclearinput: false 
      })
    } else {
      this.search(keyword);
    }

    
  },
  //输入框点击回车
  confimSearch: function (e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    var prevPage = pages[pages.length - 2];
    this.cacheKeyword(e.detail.value);
    prevPage.setData({
      reload:true,
      itemname: e.detail.value,
      keywords:'',
      xiaoqu_id: '',
      ss_id: '',
      plate_id: ''
    })
    wx.navigateBack();
  },
  cacheKeyword: function (keyword) {
    var cacheKey = 'historyword_' + appInstance.globalData.city;
    var historyWord = appInstance.getUtil.cacheGet(cacheKey, []);

    if (historyWord.length <= 5) {
      historyWord.unshift(keyword);
    } else {
      historyWord.splice(5, 1)
      historyWord.unshift(keyword);
    }
    function dedupe(array) {
      return Array.from(new Set(array));
    }
    appInstance.getUtil.cachePut(cacheKey, dedupe(historyWord));
  },
  //跳转到列表页
  navigatorList:function(e){
    var that = this;
    var key = e.currentTarget.dataset.type;
    var id = e.currentTarget.dataset.id;
    var keyword = e.currentTarget.dataset.name;

    var cacheKey = 'historyword_' + appInstance.globalData.city;
    this.cacheKeyword(keyword);

    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    var prevPage = pages[pages.length - 2];
    if (key =='2'){ //小区
      prevPage.setData({
        reload: true,
        keywords: keyword,
        itemname:'',
        xiaoqu_id: id,
        ss_id:'',
        plate_id:''
      })
    } else if (key == '4') { //地铁
      prevPage.setData({
        reload: true,
        keywords: keyword,
        itemname: '',
        xiaoqu_id: '',
        ss_id: id,
        plate_id: ''
      })
    } else if (key == '6') { //街道
      prevPage.setData({
        reload: true,
        keywords: keyword,
        itemname: '',
        xiaoqu_id: '',
        ss_id: '',
        plate_id: id
      })
    }
    wx.navigateBack();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var hotkeywords;
    var data = { 'city': appInstance.globalData.city };
    appInstance.getUtil.apiRequest('5ab097cc72fac', 'GET', data, function (res) {
      that.setData({ hotkeywords: res.data.data })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var cacheKey = 'historyword_' + appInstance.globalData.city;
    var historyWord = appInstance.getUtil.cacheGet(cacheKey,[]);
    var isShowHistoryWord = historyWord.length > 0?true:false;
    this.setData({ historyWord: historyWord, isShowHistoryWord: isShowHistoryWord});
  }
})