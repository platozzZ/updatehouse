var that
Page({
  data: {
    list: [],
    sourceList: [
      {
        source: '01',
        name: '途家',
      }, {
        source: '02',
        name: '爱彼迎',
      }, {
        source: '04',
        name: '小猪',
      }, {
        source: '05',
        name: '美团榛果',
      },
    ],
    houseUrl: ''
  },
  onLoad(options) {
    that = this
    console.log(options)
    let item = decodeURIComponent(options.item)
    console.log(item)
    let itemData = JSON.parse(item)
    console.log(itemData)

    let sourceInfo = JSON.parse(itemData.source_info);
    console.log(sourceInfo)
    sourceInfo.map((item,index) => {
      that.data.sourceList.map((items,indexs) => {
        if(item.source == items.source){
          item.name = items.name
        }
      })
    })
    that.setData({
      list: sourceInfo,
      houseUrl: itemData.house_url
    })
  },

})