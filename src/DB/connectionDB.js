import mongoose from "mongoose";

const checkDBConnection=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log("MongoDB Connected Successfully....");
        
    } catch (error) {
        console.log("Failed to connect to MongoDB:", error.message);
    }
}
export default checkDBConnection