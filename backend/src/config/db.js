// config/db.js - UPDATED ES6 VERSION
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track connection attempts
let connectionAttempts = 0;
const MAX_RETRIES = 3;
let isConnected = false;
let connection = null;

// Database connection with retry logic
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder';

    console.log(`🔗 Attempting MongoDB Atlas connection (Attempt ${connectionAttempts + 1}/${MAX_RETRIES})...`);

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
    };

    connection = await mongoose.connect(uri, options);

    console.log(`✅ MongoDB Atlas Connected Successfully!`);
    console.log(`📊 Database: ${connection.connection.name}`);
    console.log(`🎯 Host: ${connection.connection.host}`);

    connectionAttempts = 0;
    isConnected = true;

    // Setup connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

    return { connection, isConnected: true };

  } catch (error) {
    connectionAttempts++;

    console.error(`❌ MongoDB Connection Failed (Attempt ${connectionAttempts}/${MAX_RETRIES}):`);
    console.error(`   Error: ${error.message}`);

    if (connectionAttempts < MAX_RETRIES) {
      const delay = Math.pow(2, connectionAttempts) * 1000;
      console.log(`⏳ Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(); // Retry
    } else {
      console.log('⚠️  Max connection attempts reached');
      throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${error.message}`);
    }
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Received shutdown signal. Starting graceful shutdown...');

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed gracefully');
    }

    console.log('👋 Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Export functions
export const isConnectedToDB = () => isConnected;
export const getConnectionStatus = () => ({
  isConnected,
  readyState: mongoose.connection?.readyState || 0,
  host: mongoose.connection?.host || 'N/A',
  database: mongoose.connection?.name || 'N/A'
});

// Test connection
export const testConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const result = await mongoose.connection.db.command({ ping: 1 });
      return {
        connected: result.ok === 1,
        database: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      };
    }
    return { connected: false };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

// Middleware to check database status
export const dbStatusMiddleware = (req, res, next) => {
  req.dbStatus = {
    isConnected,
    readyState: mongoose.connection?.readyState || 0,
    connected: mongoose.connection?.readyState === 1
  };
  next();
};

export default connectDB;