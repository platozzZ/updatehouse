// const app = getApp()
const baseUrl = require('./baseUrl.js')
const api = require('./request.js')
console.log(baseUrl)
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}
const wxLogin = (app, that) => {
  console.log('wxLogin-app:', app)
  console.log('wxLogin-that:', that)
  // console.log(that.globalData)
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.login({
      success: res => {
        let obj = wx.getLaunchOptionsSync()
        console.log(obj)
        if (res.code) {
          let data = { 
            code: res.code,
            scene: obj.scene
          }
          console.log(data)
          api.request('/pms/weixin/upload/exchange', 'POST', data, false).then(res => {
            console.log("login", res)
            if (res.statusCode == 200) {
              if (res.data.rlt_code == "S_0000") {
                wx.setStorageSync('token', res.data.data.access_token)
                app.globalData.token = res.data.data.access_token
                app.globalData.isLogin = true
                app.globalData.user_mobile = res.data.data.user_mobile
                that.setData({
                  isLogin: true
                })
              } else {
                wx.setStorageSync('openid', res.data.data.openid)
                app.globalData.open_id = res.data.data.openid
              }
              wx.hideLoading()
              resolve(res); //返回成功提示信息
            } else {
              // wx.reLaunch({
              //   url: '/pages/login/login',
              // })
              reject(res.data.rlt_msg); //返回错误提示信息
              wx.showToast({
                title: res.data.rlt_msg,
                icon: 'none',
                duration: 2000
              })
            }
          }).catch(res => {
            wx.hideLoading()
            console.log('fail：', res)
            reject("网络连接错误"); //返回错误提示信息
            if (res.errMsg.indexOf('timeout') > -1) {
              wx.showToast({
                title: '网络连接超时，请检查网络后刷新重试',
                icon: 'none',
                duration: 2000
              })
              return
            }
            wx.showToast({
              title: '网络连接错误，请检查网络后刷新重试',
              icon: 'none',
              duration: 2000
            })
          }).finally(() => {
            // wx.stopPullDownRefresh()
          })
          
        }
      }

    })

  });
}
module.exports = {
  wxLogin: wxLogin
}
