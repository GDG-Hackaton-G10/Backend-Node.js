import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`Mongo DB connected: ${conn.connection.host}`);
    }
    catch(error){
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
}