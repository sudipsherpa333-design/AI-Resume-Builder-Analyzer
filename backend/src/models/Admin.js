// backend/src/models/Admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        select: false // Never return in queries
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    lastPasswordChange: {
        type: Date,
        default: Date.now
    },
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    lockUntil: {
        type: Date,
        select: false
    },
    meta: {
        timezone: {
            type: String,
            default: 'UTC'
        },
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark', 'auto'],
                default: 'auto'
            },
            itemsPerPage: {
                type: Number,
                default: 25,
                min: 10,
                max: 100
            }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Pre-save hook to hash password
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        this.lastPasswordChange = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
adminSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function () {
    // If previous lock has expired, reset attempts
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account if too many attempts
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // 15 minutes
    }

    return this.updateOne(updates);
};

// Static method to ensure single admin
adminSchema.statics.ensureSingleAdmin = async function () {
    const count = await this.countDocuments();
    if (count === 0) {
        throw new Error('No admin account exists. Please run the setup script.');
    }
    if (count > 1) {
        throw new Error('Multiple admin accounts detected. System supports only one admin.');
    }
};

export default mongoose.model('Admin', adminSchema);