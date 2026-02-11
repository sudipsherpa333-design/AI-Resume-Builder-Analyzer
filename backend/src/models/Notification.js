import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error', 'reminder'],
        default: 'info'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    action: {
        type: {
            type: String,
            enum: ['link', 'route', 'none'],
            default: 'none'
        },
        value: String,
        label: String
    },
    metadata: Object,
    expiresAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-expire notifications after 30 days
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 });

// Create index for user notifications
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;