// const app = getApp()
// const login = require('./wxLogin.js')
const baseUrl = require('./baseUrl.js')
//添加事件结束
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
const request = (url, method, data, tokens) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let token
    if (tokens) {
      token = wx.getStorageSync('token')
    }
    wx.request({
      url: baseUrl + url,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json',
        'access_token': token
      },
      success: function (res) {
        wx.hideLoading()
        // console.log('request:', res)
        if (res.statusCode == 200) {
          // if (!isFirst){
            if (res.data.rlt_code == 'E_0003' || res.data.rlt_code == 'E_0002') {
              // login.wxLogin(app)//
              app.globalData.isLogin = false
              
              return
            }
          // }
          
          resolve(res); //返回成功提示信息
        } else {
          reject(res.data.rlt_msg); //返回错误提示信息
        }
      },
      fail: function (res) {
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
      },
      complete: function (res) {
        // console.log('complete:',res)

      }
    })
  });
}

module.exports = {
  request: request
}
