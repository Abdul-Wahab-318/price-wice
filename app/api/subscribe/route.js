import Product from "@/models/Product"
import ProductPrice from "@/models/ProductPrice"
import Subscription from "@/models/Subscription"
import connectToDB from "@/utils/connectToDB"
import * as cheerio from 'cheerio';
import axios from "axios"


const getProductPage = async (url) => {
  try{
    const response = await axios.get(url)

    if(response.status === 200)
      return response.data
    else
    {
      console.log("error fetching product page")
      return null
    }
  }
  catch(err){
    console.log(err)
    return null
  }
}

const cleanPrice = (price) => {

  price = price.replace(/[^\d.]/g, '')

  if(price[0] === '.')
    return  parseInt(price.slice(1).replace(/[^\d.]/g, ''))

  return parseInt(price.replace(/[^\d.]/g, ''))

}

const calculateDiscountPercentage = (discounted , normal) => {
  return Math.round(100 - ( discounted / normal ) * 100)
} 

const getProductPrice = (page) =>{

  const $ = cheerio.load(page);
  $('.baadmay-gateway-wrapper').remove() // remove installment plan information
  $('body').find('script').remove() // remove stupid useless script tags that make life harder for me
  $('body').find('a').remove() // remove
  const prices = new Set()

  //if website is built with shopify the price will be inside this element
  let priceWrapper = $('.t4s-product-price')

  if(priceWrapper.length > 0){
    priceWrapper.children().each((ind , el) =>{
      console.log("child : " , ind )
      const innerText = $(el).text()
      let priceMatched = innerText.match(/(PKR\.?\s?[0-9.,]+|Rs\.?\s?[0-9.,]+)/)

      if(priceMatched)
        prices.add(cleanPrice(priceMatched[0]))

      console.log("matched : " , priceMatched)
    })
  }
  else{

    let body = String($('body').html())
    let pricesMatched = body.matchAll(/(PKR\.?\s?[0-9.,]+|Rs\.?\s?[0-9.,]+)/g)
    for (let el of pricesMatched){
      prices.add(cleanPrice(el[0]))
      console.log("matched : " ,el[0])
    }
  }

  let sortedPrices = Array.from(prices).filter( price => price > 200 ).sort((a,b) => b-a) //sort and remove prices below 200 (delivery charge or null values)

  console.log("final prices : " , sortedPrices)

  //possible discount exists
  if(sortedPrices.length >= 2){
    let normalPrice = sortedPrices[0]
    let discountedPrice = sortedPrices[1]

    return discountedPrice
  }
  else if( sortedPrices.length == 1 )
    return sortedPrices[0]
  else
    return null

}

export async function POST(req) {

  const body = await req.json();
  const { URL } = body
  const productPage = await getProductPage(URL)
  const price = getProductPrice(productPage)
  console.log('got da price baby : ' , price)
  // Do something with the parsed body

  return Response.json({ message: 'Hello World' })
}