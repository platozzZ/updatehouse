const app = getApp()
const baseUrl = require('../../utils/baseUrl.js')
const api = require('../../utils/request.js')
const login = require('../../utils/wxLogin.js')
var that
Page({
  data: {
    isLogin: null,
    sourceList: [
      {
        source: '01',
        name: '途家',
        checked: false
      }, {
        source: '02',
        name: '爱彼迎',
        checked: false
      }, {
        source: '04',
        name: '小猪',
        checked: false
      }, {
        source: '05',
        name: '美团榛果',
        checked: false
      },
    ],
  },
  onLoad() {
    that = this
    login.wxLogin(app,that)
  },
  toUpload(){
    wx.navigateTo({
      url: '../upload/upload',
    })
  },
  getPhoneNumber(e) {
    console.log(e)
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    let data = {
      iv: e.detail.iv,
      encrypted_data: e.detail.encryptedData
    }
    let storageOpenid = wx.getStorageSync('openid')
    let globalOpenid = app.globalData.open_id
    data.openid = this.checkOpenid(storageOpenid) ? storageOpenid : globalOpenid
    console.log(data)
    api.request('/pms/weixin/upload/decrypt_authorization', 'POST', data, true, false, false, app).then(res => {
      console.log('getPhoneNumber:', res)
      if (res.data.rlt_code == 'S_0000') {
        wx.setStorageSync('token', res.data.data.access_token)
        app.globalData.isLogin = true
        app.globalData.user_mobile = res.data.data.user_mobile
        wx.showToast({
          title: '授权成功',
          success(res) {
            that.setData({
              isLogin: true
            })
          }
        })
      } else {
        this.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })
  },
  checkOpenid(e) {
    if (e == 0 || e == undefined || e == null || e == false || e == '') {
      return false
    } else {
      return true
    }
  },
  onShareAppMessage(options) {
    return {
      title: '帮您上传房源到多个民宿平台',
      path: "/pages/index/index",
      success: function (res) {
        console.log('onShareAppMessage  success:', res)
      },
      fail: function (res) {
        console.log('onShareAppMessage  fail:', res)
      }
    }
  }
})
