import Product from "@/models/Product"
import ProductPrice from "@/models/ProductPrice"
import Subscription from "@/models/Subscription"
import connectToDB from "@/utils/connectToDB"
import * as cheerio from 'cheerio';
import axios from "axios"
import { NextResponse } from 'next/server'

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

    let priceWrapperText = priceWrapper.text()
    let priceMatched =  priceWrapperText.match(/(PKR\.?\s?[0-9.,]+|Rs\.?\s?[0-9.,]+)/)

    if(priceMatched){
      prices.add(cleanPrice(priceMatched[0]))
    }

    priceWrapper.children().each((ind , el) =>{
      console.log("child : " , $(el).text() )
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

    return {discounted : discountedPrice , original : normalPrice}
  }
  else if( sortedPrices.length == 1 )
    return {discounted : null , original : sortedPrices[0]}
  else
    return {discounted : null , original : null}

}

export async function POST(req , res) {

  try{
    connectToDB()

    const body = await req.json();
    const { url , email , brand } = body
    const parsed_url= new URL(url)
    let product_url = parsed_url.origin + parsed_url.pathname
    
    let product_doc = await Product.findOne({'url' : product_url})

    //if product already exists
    if(product_doc) {

      //if user tries to resubsribe with same mail to same product
      let existingSubscription = await Subscription.findOne({'userEmail' : email , product_id : product_doc._id})
      if(existingSubscription){
        return NextResponse.json({message : 'Already subscribed to this product with same email'} , {status : 400})
      }

      let subscription = await Subscription.create({
        product_id : product_doc._id ,
        userEmail : email ,
        brand
      })

      return NextResponse.json({message : 'Subscribed to product'} , {status : 201})
    }


    const productPage = await getProductPage(product_url)
    const price = getProductPrice(productPage)
    
    console.log('prices :' , price)
    console.log("product path : " , product_url)

    if(price['discounted'] === null && price['original'] === null){
      return NextResponse.json({message : "Could not find product price on the website. Are you sure the link is correct ?"} , {status:400})
    }

    let new_product = await Product.create({url : product_url})
    let new_price = await ProductPrice.create({product_id : new_product._id , price : price['discounted'] ? price['discounted'] : price['original'] })
    let subscription = await Subscription.create({
      product_id : new_product._id ,
      userEmail : email ,
      brand
    })

    return NextResponse.json({message : 'Subscribed to product'} , {status:201})
  }
  catch(err){
    console.log(JSON.stringify(err))
    return NextResponse.json({message : 'Could not subscribe to product'} , {status:400})
  }

}