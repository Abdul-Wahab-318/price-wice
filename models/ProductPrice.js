const { Schema , model , models, default: mongoose } = require('mongoose')

const ProductPriceSchema = new Schema({

    product_id : {
        type : mongoose.Types.ObjectId ,
        ref : 'Product',
        required : [true , 'product _id is required'],
    },
    price : {
        type : Number ,
        required: true,
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
      }

})

const ProductPrice = models.ProductPrice || model('ProductPrice' , ProductPriceSchema)

export default ProductPrice