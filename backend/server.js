require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seed');

const PORT = process.env.PORT || 5000;

// Standalone server starter (Used for local dev / VPS)
const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Seed default demo data if enabled
    if (process.env.SEED_DEMO_DATA !== 'false') {
      await seedDatabase().catch((e) => console.warn('Seed notice:', e.message));
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`💥 Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`❌ Server Initialization Failed: ${error.message}`);
    process.exit(1);
  }
};

// If executed directly (e.g. node server.js or npm start), start the listener
if (!process.env.VERCEL && require.main === module) {
  startServer();
}

// Export express app instance for Vercel Serverless Functions
module.exports = app;

