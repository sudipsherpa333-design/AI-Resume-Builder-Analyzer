import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, trim: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'general' },
    color: { type: String, default: '#3b82f6' },
    thumbnail: { type: String, default: '' },
    data: { type: mongoose.Schema.Types.Mixed }, // JSON or serialized template data
    active: { type: Boolean, default: true, index: true },
    usageCount: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 }
}, {
    timestamps: true
});

templateSchema.index({ name: 1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;
