import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ccirr';
  
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️ Server will remain running, but database operations will fail.');
    console.log('👉 Please ensure your MONGO_URI is correctly set in the environment variables.');
    // Removed process.exit(1) to prevent the hosting service (Render) from crashing
  }
};

export default connectDB;
