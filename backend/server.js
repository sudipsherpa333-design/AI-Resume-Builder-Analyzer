// backend/server.js - UPDATED VERSION
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

const LOG_SEPARATOR = '═'.repeat(70);

// ======================
const validateEnvironment = () => {
    console.log('\n🔍 Validating Environment Variables...');

    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'JWT_ADMIN_SECRET'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
        console.error('\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:');
        missingEnvVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\n💡 Please add these to your .env file\n');
        return false;
    }

    // Warnings
    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  OPENAI_API_KEY not set - AI features will be disabled');
    }

    console.log('✅ Environment validation completed\n');
    return true;
};

// ======================
const displayServerInfo = (port, host) => {
    console.log(LOG_SEPARATOR);
    console.log('🎉 AI RESUME BUILDER SERVER IS RUNNING');
    console.log(LOG_SEPARATOR);

    const displayHost = host === '0.0.0.0' ? 'localhost' : host;

    console.log('\n📊 SERVER INFORMATION:');
    console.log(`   Status:  ✅ RUNNING`);
    console.log(`   Port:    ${port}`);
    console.log(`   Host:    ${displayHost}`);
    console.log(`   Env:     ${NODE_ENV}`);
    console.log(`   Node:    ${process.version}`);

    console.log('\n🌐 QUICK ACCESS URLs:');
    console.log(`   API:        http://${displayHost}:${port}/`);
    console.log(`   Health:     http://${displayHost}:${port}/health`);
    console.log(`   Admin:      http://${displayHost}:${port}/admin`);
    console.log(`   API Docs:   http://${displayHost}:${port}/api/docs`);

    console.log('\n🔐 DEFAULT ADMIN ACCOUNT:');
    console.log(`   Email:    ${process.env.ADMIN_DEFAULT_EMAIL || 'superadmin@resume.ai'}`);
    console.log(`   Password: ${process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'}`);

    console.log(LOG_SEPARATOR);
    console.log('🚀 Server ready to accept connections\n');
};

// ======================
const setupGracefulShutdown = (server, mongooseConnection) => {
    const shutdown = async (signal) => {
        console.log(`\n${LOG_SEPARATOR}`);
        console.log(`📶 Received ${signal}. Starting graceful shutdown...`);
        console.log(LOG_SEPARATOR);

        try {
            server.close(() => {
                console.log('✅ HTTP server closed');
            });

            if (mongooseConnection) {
                await mongooseConnection.close();
                console.log('✅ MongoDB connection closed');
            }

            console.log('👋 Goodbye!');
            process.exit(0);

        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }

        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error('❌ Could not close connections in time, forcing shutdown');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
};

// ======================
const startServer = async () => {
    try {
        console.clear();
        console.log(LOG_SEPARATOR);
        console.log('🚀 STARTING AI RESUME BUILDER BACKEND');
        console.log(LOG_SEPARATOR);
        console.log(`📁 Environment: ${NODE_ENV}`);
        console.log(`📁 Directory: ${__dirname}`);

        // Validate environment
        if (!validateEnvironment()) {
            process.exit(1);
        }

        // Import app from src directory
        const { initializeApp } = await import('./src/app.js');

        // Initialize application
        console.log('\n🔄 Initializing application...');
        const { app, httpServer, mongooseConnection } = await initializeApp();

        // Start server
        const server = httpServer.listen(PORT, HOST, () => {
            displayServerInfo(PORT, HOST);
        });

        // Setup graceful shutdown
        setupGracefulShutdown(server, mongooseConnection);

        return { server, app, httpServer };

    } catch (error) {
        console.error('\n❌ FATAL ERROR STARTING SERVER:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);

        if (error.code === 'MODULE_NOT_FOUND') {
            console.error('\n💡 Missing module or file. Check:');
            console.error('   1. Run: npm install');
            console.error('   2. Check if src/app.js exists');
            console.error('   3. Verify file paths');

            // Create missing directories
            console.error('\n📁 Creating missing directories...');
            const fs = await import('fs');
            const missingDirs = [
                'src/config',
                'src/routes',
                'uploads',
                'admin-panel',
                'logs'
            ];

            missingDirs.forEach(dir => {
                const dirPath = join(__dirname, dir);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                    console.log(`   Created: ${dir}`);
                }
            });
        }

        process.exit(1);
    }
};

// Start the server
startServer();