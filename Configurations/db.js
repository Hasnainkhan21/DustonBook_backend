const mongoose = require('mongoose');
const dB_URI = process.env.DB_URI;

const connectDB = async() =>{
    try{
        await mongoose.connect(dB_URI);
        console.log("✅ Database connected successfully");
    }catch(error){
        console.error("Error connecting to the database", error);
        process.exit(1);
    }
}
module.exports = connectDB;