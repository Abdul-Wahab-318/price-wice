"use client"
import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

export default function SubscriptionForm() {

    const [itemURL , setItemURL] = useState("")
    const [brand , setBrand] = useState('')
    const [email , setEmail] = useState('')
    const [loading , setLoading] = useState(false)

    const getBrandName = (url) => {
        try{
            const parsedUrl = new URL(url);
            const match = parsedUrl.hostname.match(/^(?:https?:\/\/)?(?:www\.)?([^./]+)\./)
            const domainName = match ? match[1] : null;

            return domainName
        }
        catch(err){
            console.log(err)
            return "other"
        }
    };

    const brands = [
        "monark",
        "sapphire",
        "khaadi",
        "bonanzasatrangi",
        //"junaidjamshed",
        "ethnic",
        "nishatlinen",
        "beechtree",
        "gulahmed", //risky
        "edenrobe",
        "sanasaafinaz",
        //"elan",
        "kayseria",
        "zarashahjahan",
        "lamaretail",
        //"lulusar",
        "generation",
        "orient",
        "mariab",
        "mushq"
    ];

    const handleOnChange = (e) =>{
        const input = e.target.value;
        setItemURL(e.target.value)
        setBrand(getBrandName(input))
    }

    const handleSubmit = async (e) => {
        try{
            setLoading(true)
            let parsedURL = new URL(itemURL)
            let body = { brand : brand , url : itemURL , email}
            let response = await axios.post('/api/subscribe/' , body)

            if(response.status === 201)
                toast.success("Subscribed to product")

            console.log(response)
        }
        catch(err){
            if (err instanceof TypeError) {
                toast.error("Invalid product URL")
            }
            if(err.status === 400)
                toast.error(err.response.data.message)

            console.error(err)
        }
        finally{
            setLoading(false)
        }
    }

  return (
    <form className='subscription-form p-6 border-2 border-black rounded-md w-full ' onSubmit={e=>e.preventDefault()}>
        <label htmlFor="" className='pb-2 block'>Product URL</label>
        <input type="text" value={itemURL} className='w-full border-2 border-[#eaeaea] px-4 py-2 rounded-md' placeholder='Enter Product URL' onChange={handleOnChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 mt-3 gap-3">
            <div>
                <label htmlFor="" className='pb-2 block'>Your Email</label>
                <input className='w-full border-2 border-[#eaeaea] px-4 py-2 rounded-md' type="email" required placeholder='your-email@gmail.com' onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
                <label htmlFor="" className='pb-2 block'>Select A Brand</label>
                <select value={brand} onChange={e=>setBrand(e.target.value)} className='w-full border-2 border-[#eaeaea] px-4 py-2 rounded-md' name="brand" id="brand" >
                    <option value="other">Select a brand</option>
                    {
                        brands.map((el,ind) => <option value={el} defaultChecked={brand==el} key={ind} >{el}</option> )
                    }
                    <option value="other">Other</option>
                </select>
            </div>
        </div>
        {
            loading ? 
            <button className="bg-slate-300 px-4 py-2 rounded-md text-white mt-6" disabled  type='submit'>Submit</button>
            :
            <button className="bg-black px-4 py-2 rounded-md text-white mt-6"  type='submit' onClick={handleSubmit}>Submit</button>
        }
        <ToastContainer />
    </form>
  )
}
