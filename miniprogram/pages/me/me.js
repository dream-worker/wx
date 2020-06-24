// miniprogram/pages/me/me.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: wx.getStorageSync("userInfo") || {}

  },
// detailPage
  bindGetUserInfo(e){
    let userInfo = e.detail.userInfo
    wx.cloud.callFunction({
      name:"login11",
      success:(e)=>{
        console.log(e)
        userInfo.openid = e.result.openid
        wx.setStorageSync('userInfo', userInfo)
        this.setData({
          userInfo
        })

      }
    })
    console.log(e)
  },
  bindLoginOut(){
    let userInfo = {}
    wx.setStorageSync('userInfo', userInfo)
    this.setData({
      userInfo
    })
  },
  scanCode() {
    wx.scanCode({
      success(res) {
        let isbn = res.result
        wx.cloud.callFunction({
          name:'douban',
          data:{isbn}
        })
        console.log(11,res)
      }
    })}
  
})