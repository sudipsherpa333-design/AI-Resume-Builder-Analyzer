// backend/src/models/AdminLog.js
import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
    adminEmail: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
            'USER_VIEWED', 'USER_UPDATED', 'USER_DELETED',
            'RESUME_VIEWED', 'RESUME_DELETED',
            'SETTINGS_UPDATED',
            'PASSWORD_CHANGED',
            'ANALYTICS_VIEWED',
            'LOGS_VIEWED',
            'SYSTEM_INFO_VIEWED'
        ],
        index: true
    },
    resource: {
        type: String,
        enum: ['user', 'resume', 'settings', 'system', 'auth', 'analytics', 'logs'],
        index: true
    },
    resourceId: {
        type: mongoose.Schema.Types.Mixed,
        index: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    status: {
        type: String,
        enum: ['success', 'failure'],
        default: 'success'
    }
}, {
    timestamps: true,
    versionKey: false
});

// TTL index - auto-delete logs after 90 days
adminLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('AdminLog', adminLogSchema);