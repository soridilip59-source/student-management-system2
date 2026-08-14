const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      if (isProduction) {
        throw new Error('MONGODB_URI must be set in production');
      }
      console.log('No MONGODB_URI provided in environment. Initializing high-performance In-Memory MongoDB Server...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`In-Memory MongoDB Server running at: ${uri}`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (isProduction) {
      throw error;
    }
    console.warn(`⚠️ Direct MongoDB connection failed (${error.message}). Falling back to In-Memory MongoDB Server...`);
    try {
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (memError) {
      console.error(`❌ MongoDB connection error: ${memError.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
