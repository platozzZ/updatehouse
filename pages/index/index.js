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
    curSource: 0,
    modalName: null,
    houseUrl: '',
    getUrlList: [
      {
        title: '途家',
        list: [
          '打开途家APP', '切换为房客', '找到您的房源', '点击分享，选择短信', '复制短信内容中的链接'
        ]
      }, {
        title: '爱彼迎',
        list: [
          '打开爱彼迎APP', '切换为旅行模式', '找到您的房源', '点击分享，选择短信', '复制短信内容中的链接'
        ]
      }, {
        title: '美团榛果',
        list: [
          '打开美团民宿APP', '切换到房东', '进入房源预览', '点击分享，选择短信', '复制短信内容中的链接'
        ]
      }, {
        title: '小猪',
        list: [
          '打开小猪APP', '切换成房东', '进入房源预览', '点击分享，选择短信', '复制短信内容中的链接'
        ]
      }
    ]
  },
  onLoad() {
    that = this
    login.wxLogin(app,that)
    console.log(that.data.isLogin)
  },
  checkTap(e){
    let sourceList = that.data.sourceList
    let source = e.currentTarget.dataset.source
    // let target = e.currentTarget.dataset.target
    let len = 0
    sourceList.map((item, index, arr) => {
      if (item.source == source) {
        item.checked = !item.checked
      }
      if (item.checked) {
        len++
      }
    })
    console.log(len)
    console.log('checkTap:', sourceList)
    that.setData({
      sourceList: sourceList,
      // [target + 'Index']: null,
      curSource: len
    })
  },
  formSubmit(e){
    console.log(e)
    let value = e.detail.value
    value.sources.map((item,index,arr) => {
      arr.splice(index, 1, { source: item, status: '0'})
    })
    console.log(value)
    that.addHouse(value)
  },
  addHouse(data){
    console.log(data)
    api.request('/pms/upload/house/new_add.do', 'POST', data, true, false, false, app).then(res => {
      console.log('addHouse:', res)

      if (res.data.rlt_code == 'S_0000') {
        that.pay(res.data.data.id)
      } else {
        this.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)
    }).finally(() => { })
  }, 
  pay(e) {
    let data = {
      upload_house_id: e
    }
    console.log(data)
    api.request('/pms/upload/weixin/order/upload_unified_order.do', 'POST', data, true).then(res => {
      console.log('pay:', res.data);
      let payData = res.data
      if (payData.rlt_code == 'S_0000') {
        wx.requestPayment({
          timeStamp: payData.data.timeStamp,
          nonceStr: payData.data.nonceStr,
          package: payData.data.package,
          signType: payData.data.signType,
          paySign: payData.data.paySign,
          success(res) {
            console.log('pay-success:', res)
            let sourceList = that.data.sourceList
            sourceList.map((item,index) => {
              item.checked = false
            })
            that.setData({
              houseUrl: '',
              sourceList: sourceList,
              curSource: 0
            })
            wx.switchTab({
              url: '../main/main',
            })
          },
          fail(res) {
            console.log('pay-fail:', res)
            that.showToast('支付失败')

          },
          complete: function (res) {
            console.log(res)
          }
        })
      } else {
        console.log('pay-codeFail:', payData)
        that.showToast(payData.rlt_msg)

      }
    }).catch(res => {
      wx.hideLoading()
      console.log('pay-fail:', res);
    }).finally(() => { })
  },

  showTips(){
    that.showToast('请选择您希望发布的平台')
  },
  showModal(e) {
    that.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(){
    that.setData({
      modalName: null
    })
  },
  textareaBlur(e) {
    console.log(e)
    that.setData({
      houseUrl: e.detail.value
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
})
