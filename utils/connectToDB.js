const mongoose = require('mongoose');
let isConnected = false 

let connectToDB = async () => {
    try{

        if( isConnected )
            return 

        await mongoose.connect(process.env.MONGODB_URI)
        isConnected = true
        console.log("Connected to Mongodb databse")
    }
    catch(e){
        console.log('Error connecting to databse ' , e)
    }
}

export default connectToDB