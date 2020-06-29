// const { userInfo } = require("os")

// miniprogram/pages/me/me.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: wx.getStorageSync("userInfo") || {}

  },
  // detailPage
  bindGetUserInfo(e) {
    let userInfo = e.detail.userInfo
    wx.cloud.callFunction({
      name: "login11",
      success: (e) => {
        console.log(e)
        userInfo.openid = e.result.openid
        wx.setStorageSync('userInfo', userInfo)
        this.setData({
          userInfo
        })

      }
    })
  },
  bindLoginOut() {
    let userInfo = {}
    wx.setStorageSync('userInfo', userInfo)
    this.setData({
      userInfo
    })
  },
  scanCode() {
    wx.scanCode({
      success:(res)=>{
        let isbn = res.result
       
        wx.showLoading({
          title: '',
        })
        wx.cloud.callFunction({
          name: 'douban',
          data: {
            isbn
          },
          success: ({
            result
          }) => {
            result.isbn = isbn
            result.userInfo = this.userInfo
            // console.log(this,userInfo,this.userInfo)

            db.collection('books').add({
              data: result,
              success: (add) => {
                if (add._id) {
                  wx.hideLoading()
                  // 如果有下划线id,说明添加成
                  wx.showModal({
                    title: '添加成功',
                    content: `图书《${result.title}》添加成功`
                  })
                }
              }
            })

          }
        })
      }
    })
  }

})