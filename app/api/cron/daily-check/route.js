import Product from "@/models/Product"
import ProductPrice from "@/models/ProductPrice"
import Subscription from "@/models/Subscription"
import connectToDB from "@/utils/connectToDB"
import * as cheerio from 'cheerio';
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'
import { getProductPage , getProductPrice , calculateChangePercentage } from "@/utils/utils";


const scrapeLatestPrice = async (product) =>{
    try{
        const product_page = await getProductPage(product.url)
        const product_price = getProductPrice(product_page)
    
        return product_price
    }
    catch(err){
        console.log("error scraping latest price : " , err.message)
        throw new Error("Error scraping Latest price")
    }
}

const didPriceChange = (latest_price , old_price) =>{

    if (latest_price['discounted'] === null && latest_price['original'] === null){
        throw new Error('Error scraping product price')
    }
    else if(latest_price['discounted'])
        return (latest_price['discounted'] !== old_price)
    
    else
        return (latest_price['original'] !== old_price)
    

}

const sendEmailToSubscribers = async (subscriptions , content) =>{

    try{
        let subscribers = subscriptions.map(subscription => subscription.userEmail).join(",")

        console.log("Sending email to subscribers : " , subscribers)

        // Create a transporter with your email provider settings
        const transporter = nodemailer.createTransport({
            service: 'gmail', // use your email service like Gmail, Outlook, etc.
            port : 465,
            secure: true,
            secureConnection : false,
            tls:{
                rejectUnauthorized : true
            },
            auth: {
                pass: "tzim fyta mpki lczo", // your email pass
                user: "price.wice.info@gmail.com"   // your email
            }
        });
        
        // Email options
        const mailOptions = {
            from: 'Price Wice price.wice.info@gmail.com',    // sender address
            to: subscribers, // list of receivers
            subject: 'Price Update on Your Subscribed Product',
            text: `Hi there,
        
                The price of the product you subscribed to, "${content.url}," has recently changed. 
                
                Previous Price: PKR ${content.old_price}
                Current Price: PKR ${content.new_price}
                Price Change: ${content.percent_change > 0 ? 'Decreased' : 'Increased'} by ${Math.abs(content.percent_change)}%
                
                Thank you for subscribing to Price-Wice alerts. We’re here to keep you updated on the latest price changes for your favorite products.
                
                Best regards,  
                The Price-Wice Team
                
                If you no longer wish to receive these alerts, you can unsubscribe`,
            
            html: `<p>Hi there,</p>
                    <p>The price of the product you subscribed to, "<strong>${content.url}</strong>," has recently changed.</p>
                    <ul>
                        <li><strong>Previous Price:</strong> PKR ${content.old_price}</li>
                        <li><strong>Current Price:</strong> PKR ${content.new_price}</li>
                        <li><strong>Price Change:</strong> ${content.percent_change > 0 ? 'Decreased' : 'Increased'} by ${Math.abs(content.percent_change)}%</li>
                    </ul>
                    <p>Thank you for subscribing to Price-Wice alerts. We’re here to keep you updated on the latest price changes for your favorite products.</p>
                    <p>Best regards,<br>
                    The Price-Wice Team</p>
                    <p style="font-size: 12px;">If you no longer wish to receive these alerts, you can unsubscribe </p>`
        
        };
    
        // Send email
        let response = await transporter.sendMail(mailOptions)
        console.log("email response : " , response.response)
    }
    catch(err)
    {
        console.log("Error sending  email : " , err)
    }
    
}

const processOneProduct = async (product) => {
    try
    {
        console.log("Product URL : " , product.url)

        const product_price_doc = await ProductPrice.findOne(
            {product_id : product._id} ,
        ).sort({createdAt : -1})//get latest

        const old_price = product_price_doc.price
        const latest_price = await scrapeLatestPrice(product)

        const price_changed = didPriceChange(latest_price , old_price)

        if(price_changed){

            const new_price = latest_price['discounted'] ? latest_price['discounted'] : latest_price['original']
            const percent_change = calculateChangePercentage(new_price, old_price)

            const new_price_doc = await ProductPrice.create({
                price : new_price,
                product_id : product._id,
                createdAt : new Date(),
                updatedAt : new Date()
            })
            const subscriptions = await Subscription.find({product_id : product._id})
            await sendEmailToSubscribers(subscriptions, {new_price , old_price , percent_change , url : product.url})

            console.log("Price changed from : " , old_price , " to " , new_price)

        }
        else{
            console.log("Product Price did not change")
        }
    }
    catch(err)
    {
        console.log(`Error processing ${product.url} : ` , err.message)
    }
}

export async function POST(req , res) {

    try{
        await connectToDB()
        const products = await Product.find()
        
        for (let product of products)
        {
            await processOneProduct(product)
        }

        return NextResponse.json({'message' : 'Completed cron job' }, {status: 200})
    }
    catch(err){
        console.error(err)
        return NextResponse.json({'message' : 'Failed cron job' }, {status: 500})
    }

}