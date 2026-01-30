import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    access: {
        type: String,
        enum: ['free', 'pro', 'premium'],
        default: 'free'
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive', 'archived'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    version: {
        type: String,
        default: '1.0'
    },
    thumbnail: {
        type: String,
        default: ''
    },
    previewImages: [{
        type: String
    }],
    htmlContent: {
        type: String,
        required: [true, 'HTML content is required']
    },
    cssContent: {
        type: String,
        default: ''
    },
    jsContent: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }],
    settings: {
        fonts: [{
            name: String,
            family: String,
            url: String
        }],
        colors: [{
            name: String,
            value: String,
            variable: String
        }],
        sections: [{
            name: String,
            required: Boolean,
            multiple: Boolean
        }],
        customFields: [{
            name: String,
            type: String,
            label: String,
            required: Boolean
        }]
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create slug from name before saving
templateSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');
    }
    next();
});

// Virtual for preview URL
templateSchema.virtual('previewUrl').get(function () {
    return `/api/templates/${this.slug || this._id}/preview`;
});

// Virtual for download URL
templateSchema.virtual('downloadUrl').get(function () {
    return `/api/templates/${this.slug || this._id}/download`;
});

// Indexes for better query performance
templateSchema.index({ name: 'text', description: 'text', tags: 'text' });
templateSchema.index({ category: 1, status: 1, access: 1 });
templateSchema.index({ featured: 1, status: 1 });
templateSchema.index({ usageCount: -1 });
templateSchema.index({ createdAt: -1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;