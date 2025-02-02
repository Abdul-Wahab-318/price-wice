const { Schema , model , models, default: mongoose } = require('mongoose')

const ProductSchema = new Schema({

    url : {
        type : String ,
        required : [true , 'URL is required'],
        minLength : [2 , 'min length is 2 characters']
    },
    brand : {
        type : String ,
        default : 'other',
        minLength : [2 , 'min length is 2 characters'],
        maxLength : [100 , 'max length is 100 characters']
    },
    currency : {
        type : String ,
        default : 'Rs.'
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    active : {
        type : Boolean ,
        default : true
    }

})

const Product = models.Product || model('Product' , ProductSchema)

export default Product