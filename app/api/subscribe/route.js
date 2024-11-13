import Product from "@/models/Product"
import ProductPrice from "@/models/ProductPrice"
import Subscription from "@/models/Subscription"
import connectToDB from "@/utils/connectToDB"
import { NextResponse } from 'next/server'
import { getProductPage , getProductPrice , cleanPrice , sortPrices  , sendEmail} from "@/utils/utils";


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
      let emailRepsonse = sendEmail(email , product_url)
      
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

    let emailRepsonse = sendEmail(email , product_url)
    
    return NextResponse.json({message : 'Subscribed to product'} , {status:201})
  }
  catch(err){
    console.log(JSON.stringify(err))
    return NextResponse.json({message : 'Could not subscribe to product'} , {status:400})
  }

}