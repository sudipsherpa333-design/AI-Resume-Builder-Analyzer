// config/db.js - UPDATED VERSION
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track connection attempts
let connectionAttempts = 0;
const MAX_RETRIES = 3;
let isLocalMode = false;
let storageInstance = null;

// Local storage fallback class
class LocalStorage {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.initialize();
  }

  async initialize() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      console.log('📁 Local storage initialized');
    } catch (error) {
      console.error('❌ Failed to initialize local storage:', error.message);
    }
  }

  async save(collection, id, data) {
    try {
      const filePath = path.join(this.dataDir, `${collection}_${id}.json`);
      const dataToSave = {
        ...data,
        _id: id,
        updatedAt: new Date().toISOString(),
        createdAt: data.createdAt || new Date().toISOString()
      };

      await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));
      console.log(`💾 Saved ${collection}/${id} to local storage`);
      return dataToSave;
    } catch (error) {
      console.error(`❌ Failed to save ${collection}/${id}:`, error.message);
      throw error;
    }
  }

  async find(collection, query = {}) {
    try {
      const files = await fs.readdir(this.dataDir);
      const collectionFiles = files.filter(file => file.startsWith(`${collection}_`));

      const items = await Promise.all(
        collectionFiles.map(async (file) => {
          const filePath = path.join(this.dataDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(content);
        })
      );

      // Simple query filtering
      return items.filter(item => {
        for (const [key, value] of Object.entries(query)) {
          if (item[key] !== value) return false;
        }
        return true;
      });
    } catch (error) {
      console.error(`❌ Failed to find ${collection}:`, error.message);
      return [];
    }
  }

  async findOne(collection, query) {
    const items = await this.find(collection, query);
    return items[0] || null;
  }

  async findById(collection, id) {
    try {
      const filePath = path.join(this.dataDir, `${collection}_${id}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async update(collection, id, data) {
    try {
      const existing = await this.findById(collection, id);
      if (!existing) {
        throw new Error('Document not found');
      }

      const updated = {
        ...existing,
        ...data,
        _id: id,
        updatedAt: new Date().toISOString()
      };

      const filePath = path.join(this.dataDir, `${collection}_${id}.json`);
      await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
      return updated;
    } catch (error) {
      console.error(`❌ Failed to update ${collection}/${id}:`, error.message);
      throw error;
    }
  }

  async delete(collection, id) {
    try {
      const filePath = path.join(this.dataDir, `${collection}_${id}.json`);
      await fs.unlink(filePath);
      console.log(`🗑️ Deleted ${collection}/${id} from local storage`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete ${collection}/${id}:`, error.message);
      return false;
    }
  }

  async count(collection) {
    try {
      const files = await fs.readdir(this.dataDir);
      return files.filter(file => file.startsWith(`${collection}_`)).length;
    } catch (error) {
      return 0;
    }
  }
}

// Get local storage instance
const getLocalStorage = () => {
  if (!storageInstance) {
    storageInstance = new LocalStorage();
  }
  return storageInstance;
};

// Check if we should use local storage
const shouldUseLocalStorage = () => {
  // Check if MONGODB_URI is missing or empty
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.trim() === '') {
    console.log('ℹ️  MONGODB_URI not found, using local storage');
    return true;
  }

  // Check for localhost fallback
  if (process.env.MONGODB_URI.includes('localhost:27017') &&
    process.env.NODE_ENV === 'development') {
    console.log('ℹ️  Using local MongoDB for development');
    return false;
  }

  return isLocalMode;
};

const connectDB = async () => {
  try {
    // Check if we should use local storage
    if (shouldUseLocalStorage()) {
      console.log('📁 Using local file storage as database fallback');
      isLocalMode = true;
      getLocalStorage(); // Initialize storage
      return { connection: null, isLocalMode: true };
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder';

    console.log(`🔗 Attempting MongoDB connection (Attempt ${connectionAttempts + 1}/${MAX_RETRIES})...`);
    console.log(`📡 URI: ${uri.includes('@') ? uri.split('@')[1] : uri}`); // Hide credentials

    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      // For MongoDB Atlas, add these options
      ssl: uri.includes('mongodb+srv://') ? true : false,
      sslValidate: uri.includes('mongodb+srv://') ? true : false,
      // Retry logic
      retryReads: true,
      retryWrites: true,
      maxIdleTimeMS: 60000,
    };

    const conn = await mongoose.connect(uri, options);

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🎯 Host: ${conn.connection.host}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`⚡ Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    // Reset attempts on success
    connectionAttempts = 0;
    isLocalMode = false;

    // Setup connection event handlers
    setupConnectionEvents(conn);

    return { connection: conn, isLocalMode: false };

  } catch (error) {
    connectionAttempts++;

    console.error(`❌ MongoDB Connection Failed (Attempt ${connectionAttempts}/${MAX_RETRIES}):`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    console.error(`   Name: ${error.name}`);

    if (connectionAttempts < MAX_RETRIES) {
      // Exponential backoff
      const delay = Math.pow(2, connectionAttempts) * 1000;
      console.log(`⏳ Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(); // Retry
    } else {
      console.log('⚠️  Max connection attempts reached');
      console.log('📁 Switching to local file storage mode...');

      isLocalMode = true;
      getLocalStorage(); // Initialize storage

      return { connection: null, isLocalMode: true };
    }
  }
};

const setupConnectionEvents = (conn) => {
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
    isLocalMode = true;
    console.log('📁 Temporarily using local storage...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
    isLocalMode = false;
    console.log('🔄 Switched back to database mode');
  });

  mongoose.connection.on('connecting', () => {
    console.log('🔄 Connecting to MongoDB...');
  });

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
  });

  mongoose.connection.on('open', () => {
    console.log('🔓 MongoDB connection opened');
  });

  mongoose.connection.on('close', () => {
    console.log('🔒 MongoDB connection closed');
  });
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Received shutdown signal. Starting graceful shutdown...');

  try {
    // Close MongoDB connection if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed gracefully');
    }

    // Save any pending data in local storage
    if (isLocalMode) {
      console.log('💾 Local storage cleanup completed');
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Export functions for checking storage mode
export const isLocalStorageMode = () => isLocalMode;
export const getStorage = () => isLocalMode ? getLocalStorage() : null;

// Test connection
export const testConnection = async () => {
  if (isLocalMode) {
    console.log('📁 Currently in local storage mode');
    return { connected: false, mode: 'local' };
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const result = await mongoose.connection.db.command({ ping: 1 });
      return {
        connected: result.ok === 1,
        mode: 'database',
        database: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      };
    }
    return { connected: false, mode: 'disconnected' };
  } catch (error) {
    return { connected: false, mode: 'error', error: error.message };
  }
};

// Middleware to check database status
export const dbStatusMiddleware = (req, res, next) => {
  req.dbStatus = {
    isLocalMode,
    readyState: mongoose.connection.readyState,
    connected: mongoose.connection.readyState === 1
  };
  next();
};

export default connectDB;