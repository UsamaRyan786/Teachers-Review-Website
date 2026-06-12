import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ucp-teacher-reviews';

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`Local MongoDB unavailable (${err.message}). Starting in-memory database...`);
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri('ucp-teacher-reviews');
    await mongoose.connect(memUri);
    console.log('In-memory MongoDB ready (data resets when server stops)');
  }
};

export default connectDB;
