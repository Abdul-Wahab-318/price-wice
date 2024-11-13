const mongoose = require('mongoose');
let isConnected = false 

let connectToDB = async () => {
    try{

        if( isConnected )
            return 

        await mongoose.connect("mongodb+srv://wahabmaliq:oQOAIjq1S9WdoXIB@cluster0.jyb0m.mongodb.net/pricewice?retryWrites=true&w=majority&appName=Cluster0")
        isConnected = true
        console.log("Connected to Mongodb databse")
    }
    catch(e){
        console.log('Error connecting to databse ' , e)
    }
}

export default connectToDB