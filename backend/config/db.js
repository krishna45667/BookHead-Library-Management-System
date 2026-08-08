const mongoose = require('mongoose')
const connectDb = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)

        console.log("✅ MongoDB Connected Successfully")

    }catch (err){
        console.log("❌ MongoDB Connection Failed");
        console.log(err.message);
        process.exit(1);

    }
}
module.exports = connectDb;