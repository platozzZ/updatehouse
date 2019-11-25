const app = getApp()
const baseUrl = require('../../utils/baseUrl.js')
const api = require('../../utils/request.js')
var that
Page({
  data: {
    isLogin: null,
    list: []
  },
  onLoad() {
    that = this
  },
  getList() {
    api.request('/pms/upload/house/new_list.do', 'POST', '', true).then(res => {
      console.log('getList:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        that.setData({
          list: res.data.data
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })
  },
  onShow(){
    if (!app.globalData.isLogin) {
      return
    }
    that.getList()
  },
  toProgress(e) {
    console.log(e)
    let item = encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item))
    // let info = encodeURIComponent(JSON.stringify(e.currentTarget.dataset.info))
    // let houseUrl = encodeURIComponent(JSON.stringify(e.currentTarget.dataset.url))
    // console.log(info)
    // console.log(houseUrl)
    wx.navigateTo({
      url: '../progress/progress?item=' + item
        // + '&house_url=' + houseUrl,
    })
  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
})
