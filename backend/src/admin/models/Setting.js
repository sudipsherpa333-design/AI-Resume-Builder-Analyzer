// backend/src/models/Settings.js
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    // System
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    registrationEnabled: {
        type: Boolean,
        default: true
    },

    // Features
    features: {
        aiAnalysis: {
            type: Boolean,
            default: true
        },
        resumeExport: {
            type: Boolean,
            default: true
        },
        templateCustomization: {
            type: Boolean,
            default: true
        },
        userRegistration: {
            type: Boolean,
            default: true
        }
    },

    // Limits
    limits: {
        maxResumesPerUser: {
            type: Number,
            default: 20,
            min: 1,
            max: 100
        },
        maxFileSizeMB: {
            type: Number,
            default: 10,
            min: 1,
            max: 50
        },
        dailyResumeAnalysisLimit: {
            type: Number,
            default: 50,
            min: 10,
            max: 1000
        }
    },

    // Branding
    branding: {
        siteName: {
            type: String,
            default: 'AI Resume Builder'
        },
        logoUrl: {
            type: String,
            default: ''
        },
        primaryColor: {
            type: String,
            default: '#3b82f6'
        },
        secondaryColor: {
            type: String,
            default: '#1e40af'
        }
    },

    // Email
    email: {
        smtpHost: {
            type: String,
            default: ''
        },
        smtpPort: {
            type: Number,
            default: 587
        },
        smtpUser: {
            type: String,
            default: ''
        },
        smtpPassword: {
            type: String,
            default: ''
        },
        fromEmail: {
            type: String,
            default: 'noreply@resumebuilder.com'
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        }
    },

    // Analytics
    analytics: {
        googleAnalyticsId: {
            type: String,
            default: ''
        },
        trackUserBehavior: {
            type: Boolean,
            default: true
        }
    },

    // Version tracking
    version: {
        type: String,
        default: '1.0.0'
    },

    updatedBy: {
        type: String, // admin email
        default: ''
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

export default mongoose.model('Settings', settingsSchema);