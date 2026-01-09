const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  // Resume Content
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    website: String,
    linkedin: String,
    github: String,
    summary: String
  },

  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String,
    grade: String
  }],

  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String,
    achievements: [String]
  }],

  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    category: String,
    years: Number
  }],

  projects: [{
    name: String,
    description: String,
    technologies: [String],
    startDate: Date,
    endDate: Date,
    url: String,
    github: String
  }],

  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String
  }],

  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['Basic', 'Conversational', 'Professional', 'Native']
    }
  }],

  // Resume Settings
  template: {
    type: String,
    default: 'classic'
  },
  theme: {
    type: String,
    default: 'light'
  },
  font: {
    type: String,
    default: 'Arial'
  },
  fontSize: {
    type: String,
    default: 'medium'
  },
  colorScheme: {
    primary: String,
    secondary: String,
    accent: String
  },

  // Status and Tracking
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  lastViewed: Date,
  lastDownloaded: Date,

  // File Information
  fileUrl: String,
  fileFormat: {
    type: String,
    enum: ['pdf', 'docx', 'txt', 'html'],
    default: 'pdf'
  },
  fileSize: Number,
  thumbnailUrl: String,

  // SEO and Sharing
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  shareUrl: String,
  shareCount: {
    type: Number,
    default: 0
  },

  // Analytics
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  sectionsCompleted: [String],
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  lastEdited: Date,

  // Admin Management
  adminNotes: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  flags: [{
    type: String,
    enum: ['review', 'priority', 'featured', 'spam', 'inappropriate']
  }],

  // Versioning
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    content: mongoose.Schema.Types.Mixed,
    version: Number,
    savedAt: Date,
    changes: String
  }],

  // Audit Trail
  createdByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  deletedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // Timestamps
  deletedAt: Date,
  publishedAt: Date,
  archivedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
resumeSchema.index({ user: 1, status: 1 });
resumeSchema.index({ status: 1, createdAt: -1 });
resumeSchema.index({ 'personalInfo.fullName': 'text', title: 'text', 'skills.name': 'text' });
resumeSchema.index({ isFeatured: 1, createdAt: -1 });
resumeSchema.index({ views: -1 });
resumeSchema.index({ downloads: -1 });
resumeSchema.index({ createdAt: -1 });
resumeSchema.index({ slug: 1 }, { unique: true });
resumeSchema.index({ userEmail: 1 });
resumeSchema.index({ 'flags': 1 });

// Virtuals
resumeSchema.virtual('isActive').get(function () {
  return this.status !== 'deleted' && this.status !== 'archived';
});

resumeSchema.virtual('isPublished').get(function () {
  return this.status === 'published';
});

resumeSchema.virtual('ageInDays').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

resumeSchema.virtual('formattedCreatedAt').get(function () {
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware
resumeSchema.pre('save', function (next) {
  // Generate slug from title if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }

  // Update lastEdited timestamp
  if (this.isModified()) {
    this.lastEdited = new Date();
  }

  // Calculate completion percentage
  if (this.isModified('personalInfo') ||
    this.isModified('education') ||
    this.isModified('experience') ||
    this.isModified('skills')) {
    this.calculateCompletion();
  }

  next();
});

// Methods
resumeSchema.methods.calculateCompletion = function () {
  let completedFields = 0;
  let totalFields = 0;

  // Personal Info (weight: 30%)
  const personalInfoFields = ['fullName', 'email', 'phone', 'summary'];
  totalFields += personalInfoFields.length;
  completedFields += personalInfoFields.filter(field =>
    this.personalInfo && this.personalInfo[field] &&
    this.personalInfo[field].toString().trim().length > 0
  ).length;

  // Education (weight: 20%)
  totalFields += 1;
  if (this.education && this.education.length > 0) {
    completedFields += 1;
  }

  // Experience (weight: 30%)
  totalFields += 1;
  if (this.experience && this.experience.length > 0) {
    completedFields += 1;
  }

  // Skills (weight: 20%)
  totalFields += 1;
  if (this.skills && this.skills.length > 0) {
    completedFields += 1;
  }

  this.completionPercentage = Math.round((completedFields / totalFields) * 100);

  // Track completed sections
  this.sectionsCompleted = [];
  if (this.personalInfo && this.personalInfo.fullName) this.sectionsCompleted.push('personal');
  if (this.education && this.education.length > 0) this.sectionsCompleted.push('education');
  if (this.experience && this.experience.length > 0) this.sectionsCompleted.push('experience');
  if (this.skills && this.skills.length > 0) this.sectionsCompleted.push('skills');
};

resumeSchema.methods.addAdminNote = function (adminId, note) {
  this.adminNotes.push({
    admin: adminId,
    note: note.trim()
  });
  return this.save();
};

resumeSchema.methods.addFlag = function (flag) {
  if (!this.flags.includes(flag)) {
    this.flags.push(flag);
  }
  return this.save();
};

resumeSchema.methods.removeFlag = function (flag) {
  this.flags = this.flags.filter(f => f !== flag);
  return this.save();
};

resumeSchema.methods.toAdminResponse = function () {
  const resume = this.toObject();

  // Add virtuals
  resume.isActive = this.isActive;
  resume.isPublished = this.isPublished;
  resume.ageInDays = this.ageInDays;
  resume.formattedCreatedAt = this.formattedCreatedAt;

  // Remove sensitive user data if needed
  delete resume.user?.password;
  delete resume.user?.resetPasswordToken;
  delete resume.user?.resetPasswordExpires;

  return resume;
};

// Static methods
resumeSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
        deleted: { $sum: { $cond: [{ $eq: ['$status', 'deleted'] }, 1, 0] } },
        totalViews: { $sum: '$views' },
        totalDownloads: { $sum: '$downloads' },
        avgCompletion: { $avg: '$completionPercentage' }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    drafts: 0,
    published: 0,
    archived: 0,
    deleted: 0,
    totalViews: 0,
    totalDownloads: 0,
    avgCompletion: 0
  };
};

resumeSchema.statics.getDailyStats = async function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        views: { $sum: '$views' },
        downloads: { $sum: '$downloads' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;