const { Schema , model , models, default: mongoose } = require('mongoose')

const SubscriptionSchema = new Schema({

    product_id : {
        type : mongoose.Types.ObjectId ,
        ref : 'Product',
        required : [true , 'product id is required'],
    },
    userEmail : {
        type : String ,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
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

const Subscription = models.Subscription || model('Subscription' , SubscriptionSchema)

export default Subscription