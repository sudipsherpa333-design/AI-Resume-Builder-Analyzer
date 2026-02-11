import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['resume_created', 'resume_updated', 'resume_deleted', 'resume_exported',
            'resume_analyzed', 'profile_updated', 'settings_changed'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        resumeId: mongoose.Schema.Types.ObjectId,
        resumeTitle: String,
        format: String,
        score: Number
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: -1
    }
});

// Index for user activities
activitySchema.index({ userId: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;