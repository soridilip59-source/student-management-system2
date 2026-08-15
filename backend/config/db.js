const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let cachedConn = null;
let mongod = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState >= 1) {
    return cachedConn;
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      if (isProduction) {
        console.warn('⚠️ Warning: MONGODB_URI not provided in production/serverless environment.');
      } else {
        console.log('No MONGODB_URI provided. Initializing In-Memory MongoDB Server...');
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
      }
    }

    if (uri) {
      cachedConn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      });
      console.log(`✅ MongoDB Connected: ${cachedConn.connection.host}`);
      return cachedConn;
    }
  } catch (error) {
    console.warn(`⚠️ Direct MongoDB connection failed: ${error.message}`);
    if (!isProduction) {
      try {
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        cachedConn = await mongoose.connect(memUri, { bufferCommands: false });
        console.log(`✅ In-Memory MongoDB Connected: ${cachedConn.connection.host}`);
        return cachedConn;
      } catch (memError) {
        console.error(`❌ In-Memory connection error: ${memError.message}`);
      }
    }
  }
  return null;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
