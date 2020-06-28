// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
// todo 干啥的
const cheerio = require('cheerio')
const doubanbook = require('doubanbook')
cloud.init()

// 定义函数
async function searchDouban(isbn){
  const url = 'https://search.douban.com/book/subject_search?search_text='+isbn.trim()
// TODO为啥async
// TODO saxios .get就是调用接口？
// console.log(11,url)
let searchInfo =await axios.get(url)
  // console.log(searchInfo.data)
  // return searchInfo.data
// 豆瓣isbn搜索结果页面，信息字段被加密
// 分组(.*)
  // window.__DATA__ = "u6CbDixmwYvRGEA/VDUrN4PZC3QwSoABrMc/Me2W0qjA4jYH4Ql4olw2sGhHfugKCqY79BYUH+1R3F0NwLRKWjH15CJh3vMTR0a2BgqxPUkB58/VoOfC5FVFpb0y4skutHYEQuntAY5ifKjZGlm7E2Ka0wgOTxCaP51GYpowLerMrgzikwSlnwnN9vrEuvZC+SfYz6AbiE49Uq3Ay0HsK/Xt1qGPypUQunA3ZbfgrGQc4RNc8nWNXqhsyCgL7sWxJ6Ow2Tbau5gUn2xEcrqV0WBVYMSAKZFegdV9+yivUW5AaBNljSKT4lOiPk3IVIdzJj7V41Ap2P2PRwSNpB+gPxnxzmKsB8+fcYKmWOZPvBsomcQvqeGsHiHOvhZWlF3kqH75JoRaoocJ4cqfUvHEjJULkY6K0spGMEsMZephMSSajdzE0NbLS79gmNss3bS6XKt9fSm84OrSeWjlbzEG9rO+jmytRxL6Pzlh/YQA+eZHSqU3CVoAUAg7Oh/ALFEZiRXUD+RV8E3xpMGM3RMto02+bjxIdwnfvqhkeNAC+Im710YvsVfF/iCBIwC2gnfypsSUQ5LiLYqyfb5B7ffU8xZd3Ym1+2qMCcfg0UaOF+wmeB0HzfBv/R/Cegm6iWVWEDUPiI0vNwrEEUqo65zEQYN4rCeN8xnHq5FL51u/y4JV6HpWtNywFgtbUFU8Zw3UaXfzKauddoFxvfmIpJzChkDzL4eu9cTjdB8gQoAx5FoKrmppity1HQG44aLT237gxTw//XzIxH6mX31jYRIipZ0PFxnNmJHQteV0oTqV1Q8c8J8RkqGQ95Tw/Js9sDjzxcd+Uj08BgMSKCGh8tPVsH0UMZGXdZRe2/NgTp0Sty0Y8Iyes97IJcC8691ns6SlSCg5Fvhvcqlb6Y9kTjZGBLbqIyxGkT1wu7VyV6LORM09JYSmunUiotyujk6l1K0EfifSgr6eTO8QRiM0n7cKBupxrpQi24lS7+o12PBNBUDAv1rftztqlD5QeUg6ExQ6AXe1WSujO+L+iohaxH2EydFmoi8vCgnop7/Jms++dYMY//vvssp+7KU1gJAzEA7lq9WV7ENAp4i7KYNlZvtlmZIAHc1Bf618kZQGcMfP58mpfpSmunZ4W1UTSrnTIR1aogOdBIDS5fa+Qm0Fn2ejRzjrY/B7ACtUlEUX5SHND6iq3u6C83ez50JdOOrx6Y5t4cDtSBrjgVBZeo5XuRslNmStur1/X7pFwtKCaZd6RKMZBf+h43HDqOi6Y8VRTPK1GUODKslU74KizpfoDV2U4Pe/z5hClwX7egrW65iMO5D6GLdHTvqFmFFRMROHVgtA1cNFX2nXnEEvrr4=";

  let reg = /window\.__DATA__ = "(.*)"/
  if(reg.test(searchInfo.data)){
  //   // 如果匹配，说明存在书籍的加密信息，需解密
  //   // 取第一个分组进行解密
    let searchData = doubanbook(RegExp.$1)[0] 
    return searchData
  }

}
async function getDouban(isbn){
  const detailInfo = await searchDouban(isbn)
  // 根据解密后数据，拿到详情页面url
  const detailData = await axios.get(detailInfo.url)
  // TODO: detailData.data  和 detailData 有啥区别
  // console.log(11, detailData.data )
  // 拿到详细信息，组装
  const $ = cheerio.load(detailData.data)
  let tags = []
// console.log(22,$('#link-report .intro').text())
 $('#db-tags-section .indent span a').each((i,v)=>{
   tags.push({
     title:$(v).text()
   })
 })
 let comments = []
 $('.review-list').children("div").each((i,v)=>{
  comments.push({
    avator:$(v).find('.avator img').attr('src'),
    name:$(v).find('.name').text(),
    star:$(v).find('.main-title-rating').attr('class').split(' ')[0].substring(7),
    bd:$(v).find('.main-bd h2 a').text(),
    content:$(v).find('.short-content').text(),
    time:$(v).find('.main-meta').text()  
  })
 })

  const res = {
    creat_time:new Date().getTime(),
    image:detailInfo.cover_url,
    rate:detailInfo.rating.value,
    url:detailInfo.url,
    title:detailInfo.title,
    author: detailInfo.abstract,
    // 爬取书籍详情介绍
    summary: $('#link-report .intro').text(),
    tags,
    comments
  }
  console.log(11,res)
  return res

}
getDouban(" 9787521715989")
// 云函数入口函数
exports.main = async (event, context) => {
  const {isbn} = event
  if(isbn){
    // 满足条件，调用函数
    return getDouban(isbn)
  }else{
    // 否则，返回异常返回体
    return {
      code:-1,
      msg:'请扫描正确的图书二维码'
    }
  }
}
