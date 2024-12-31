import axios from "axios"
import * as cheerio from 'cheerio';
import nodemailer from 'nodemailer'

const regexPattern = /(?:PKR|Rs|USD|\$|£)\.?\s?[0-9][0-9.,]*/
const regexPatternGlobal = /(?:PKR|Rs|USD|\$|£)\.?\s?[0-9][0-9.,]*/g

export const getProductPage = async (url) => {
    try{
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/',
        }
      });

      if(response.status === 200)
        return response.data

      else
      {
        console.log("error fetching product page")
        return null
      }
    }
    catch(err){
      console.log("error fetching page : " ,err)
      if(err.status === 404)
      {
        console.log("Page not found")
        throw new Error("Page not found")
      }
      
      throw new Error("Error fetching product page")
    }
}

export const getProductPrice = (page) =>{

  const pageCleaned = page.replace(/(&nbsp;)/g, "")
  const $ = cheerio.load(pageCleaned);
  $('.installment-block').remove()
  $('script').remove() // remove stupid useless tags that make life harder for me
  $('style').remove()
  $('template').remove()
  $('footer').remove()
  $('svg').remove()
  $('link').remove()
  $('a').remove()
  $('.baadmay-gateway-wrapper').remove() // remove installment plan information

  const prices = new Set()

  let shopifyPriceWrapper = $('.t4s-product-price') //if website is built with shopify the price will be inside this element
  let jDotPriceWrapper = $('.product-info-price') //special edge case for J.
  let priceWrapper = shopifyPriceWrapper.length !== 0 ? shopifyPriceWrapper : jDotPriceWrapper

  if( priceWrapper.length !== 0 )
  {
    let priceWrapperText = priceWrapper.text()
    let priceMatched =  priceWrapperText.match(regexPattern)

    if(priceMatched)
      prices.add(cleanPrice(priceMatched[0]))

    priceWrapper.children().each((ind , el) =>{

      const innerText = $(el).text()
      let priceMatched = innerText.match(regexPattern)
      if(priceMatched)
        prices.add(cleanPrice(priceMatched[0]))
    })

  }
  else
  {
    let body_text = $('body').text().replace(/\s+/g , " ")
    let pricesMatched = body_text.matchAll(regexPatternGlobal)
    for (let el of pricesMatched){
      prices.add(cleanPrice(el[0]))
    }
  }

  let sortedPrices = sortPrices(Array.from(prices))
  console.log("sorted prices : " , sortedPrices)

  //possible discount exists
  if(sortedPrices.length >= 2)
  {
    let normalPrice = sortedPrices[0]
    let discountedPrice = sortedPrices[1]

    return {discounted : discountedPrice , original : normalPrice}
  }
  else if( sortedPrices.length == 1 )
    return {discounted : null , original : sortedPrices[0]}
  else
    return {discounted : null , original : null}

}

export const sendWelcomeEmail = async (userEmail , product_url) =>{
  try{

    console.log("hello it is me i am going to send the email now let us depart : " , userEmail , product_url)
    const transporter = nodemailer.createTransport({
        service: 'gmail', // use your email service like Gmail, Outlook, etc.
        port : 465,
        secure: true,
        secureConnection : false,
        tls:{
            rejectUnauthorized : true
        },
        auth: {
          pass: process.env.EMAIL_PASS, // your email pass
          user: process.env.EMAIL_ADDRESS   // your email
        }
    });
    
    // Email options
    const mailOptions = {
        from: 'Price Wice price.wice.info@gmail.com',    // sender address
        to: userEmail,
        subject: 'Welcome to Price Wice!',
        text: `Hi there! \n\nThank you for subscribing to Price Wice. We’re excited to help you keep track of product prices and save on your purchases!\nProduct to be tracked : ${product_url}\n\nIf you have any questions, feel free to reach out.\n\nBest regards,\nThe Price Wice Team`,
        html: `<p>Hi there!</p><p>Thank you for subscribing to <strong>Price Wice</strong>. We’re excited to help you keep track of product prices and save on your purchases!</p><p>Product to be tracked : ${product_url}</p></p><p>If you have any questions, feel free to reach out.</p><p>Best regards,<br>The Price Wice Team</p>`
    };
  
    let response = await transporter.sendMail(mailOptions)
    console.log("email response : " , response)
  }
  catch(err)
  {
    console.log("Error sending  email : " , err)
  }
  
}

export const cleanPrice = (price) => {
  
    price = price.replace(/[^\d.]/g, '')
  
    if(price[0] === '.')
      return  parseInt(price.slice(1).replace(/[^\d.]/g, ''))
  
    return parseInt(price.replace(/[^\d.]/g, ''))
  
}
  
export const sortPrices = (prices) => {
  
    let filteredPrices = prices.filter(price => price > 200)
    
    if(filteredPrices.length >= 2)
      return filteredPrices.slice(0,2).sort( (a,b) => b-a)
    else
      return filteredPrices.sort( (a,b) => b-a)
}
  
export const calculateChangePercentage = (discounted , normal) => {
  return Math.round(100 - ( discounted / normal ) * 100)
} 
