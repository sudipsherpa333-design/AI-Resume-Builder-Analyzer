// src/utils/logger.js
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''
                }`;
        })
    ),
    defaultMeta: { service: 'ai-resume-builder' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // File transports (only in production)
        ...(process.env.NODE_ENV === 'production' ? [
            new winston.transports.File({
                filename: path.join(__dirname, '../../logs/error.log'),
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5
            }),
            new winston.transports.File({
                filename: path.join(__dirname, '../../logs/combined.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5
            })
        ] : [])
    ],
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Export the logger instance
export default logger;