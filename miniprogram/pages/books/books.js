// miniprogram/pages/books/books.js
const db = wx.cloud.database()
let isInit = true
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: wx.getStorageSync('userInfo') || {},
    page: 1,
    pageSize: 4,
    books: []

  },
  getList() {
    console.log(this.data.page)
    isInit = this.data.page === 1 // 为1 是init
    wx.showLoading()
    // 从数据库取数据
    let ret = db.collection('books').orderBy("creat_time", 'desc')
    console.log('2222,ret', ret)
    // 拿到所有数据，每次请求只能最多20条
    const offset = this.data.page * this.data.pageSize // 已经加载了的条数
    console.log(offset)
    if (offset > this.data.pageSize) {
      // 说明不是第一页
      ret = ret.skip(offset) // 偏移过去已经加载过的数据，拿到剩余的数据
      console.log(111, ret)
    }
    ret = ret.limit(this.data.pageSize).get().then((books) => {
      console.log('books', books)
      // 剩余未展示过的数据，根据分页要求加载当前页条数
      console.log(isInit)
      this.setData({
        books: isInit ? books.data : this.data.books.concat(books.data)
        //  当前分页的数据
        // 那么如何让之前加载过的，和最近加载的数据，一起展示在页面上呢
      })
      wx.hideLoading()
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
    console.log('到底了')
    console.log(isInit)
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.getList()
    })


  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})