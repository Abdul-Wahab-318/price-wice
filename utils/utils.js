import axios from "axios"

export const getProductPage = async (url) => {
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
  
export const calculateDiscountPercentage = (discounted , normal) => {
    return Math.round(100 - ( discounted / normal ) * 100)
} 