// backend/src/models/Resume.js - COMPLETE ES6 VERSION
import mongoose from 'mongoose';

// ==================== SCHEMA DEFINITIONS ====================

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function (value) {
        // End date should be after start date if provided
        return !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  bulletPoints: [{
    type: String,
    trim: true,
    maxlength: [200, 'Bullet point cannot exceed 200 characters']
  }],
  achievements: [{
    type: String,
    trim: true,
    maxlength: [300, 'Achievement cannot exceed 300 characters']
  }],
  technologies: [{
    type: String,
    trim: true
  }]
}, {
  _id: true,
  timestamps: false
});

const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
    maxlength: [100, 'Degree cannot exceed 100 characters']
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true,
    maxlength: [200, 'Institution cannot exceed 200 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  gpa: {
    type: String,
    trim: true,
    maxlength: [10, 'GPA cannot exceed 10 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  honors: [{
    type: String,
    trim: true,
    maxlength: [100, 'Honor cannot exceed 100 characters']
  }],
  relevantCourses: [{
    type: String,
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  }]
}, {
  _id: true,
  timestamps: false
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Project title cannot exceed 100 characters']
  },
  role: {
    type: String,
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  technologies: [{
    type: String,
    trim: true
  }],
  startDate: Date,
  endDate: Date,
  link: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  githubUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  demoUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  keyAchievements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Achievement cannot exceed 200 characters']
  }]
}, {
  _id: true,
  timestamps: false
});

const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Certification name is required'],
    trim: true,
    maxlength: [200, 'Certification name cannot exceed 200 characters']
  },
  issuer: {
    type: String,
    required: [true, 'Issuer is required'],
    trim: true,
    maxlength: [100, 'Issuer cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  expiryDate: Date,
  credentialId: {
    type: String,
    trim: true,
    maxlength: [50, 'Credential ID cannot exceed 50 characters']
  },
  link: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  skills: [{
    type: String,
    trim: true
  }]
}, {
  _id: true,
  timestamps: false
});

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  category: {
    type: String,
    enum: ['technical', 'soft', 'language', 'framework', 'tool'],
    default: 'technical'
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 50
  },
  lastUsed: Date,
  proficiency: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  }
}, {
  _id: true,
  timestamps: false
});

const languageSchema = new mongoose.Schema({
  language: {
    type: String,
    required: [true, 'Language is required'],
    trim: true,
    maxlength: [50, 'Language cannot exceed 50 characters']
  },
  proficiency: {
    type: String,
    enum: ['native', 'fluent', 'intermediate', 'basic', 'beginner'],
    default: 'intermediate'
  },
  level: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  certified: Boolean,
  certification: String
}, {
  _id: true,
  timestamps: false
});

const personalInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters']
  },
  zipCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Zip code cannot exceed 20 characters']
  },
  linkedin: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  github: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  portfolio: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [2000, 'Summary cannot exceed 2000 characters']
  },
  jobTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  photoUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  }
}, {
  _id: false,
  timestamps: false
});

const templateSettingsSchema = new mongoose.Schema({
  templateName: {
    type: String,
    enum: ['modern', 'classic', 'creative', 'minimal', 'professional', 'executive'],
    default: 'modern'
  },
  colors: {
    primary: {
      type: String,
      default: '#3b82f6',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
    },
    secondary: {
      type: String,
      default: '#6b7280',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
    },
    accent: {
      type: String,
      default: '#10b981',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
    },
    background: {
      type: String,
      default: '#ffffff',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
    },
    text: {
      type: String,
      default: '#000000',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
    },
    header: {
      type: String,
      default: '#1e40af',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
    }
  },
  font: {
    type: String,
    enum: ['Roboto', 'Inter', 'Montserrat', 'Open Sans', 'Lato', 'Poppins', 'Merriweather'],
    default: 'Roboto'
  },
  fontSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  spacing: {
    type: String,
    enum: ['compact', 'normal', 'relaxed'],
    default: 'normal'
  },
  showPhoto: {
    type: Boolean,
    default: false
  },
  photoPosition: {
    type: String,
    enum: ['left', 'right', 'top'],
    default: 'left'
  },
  layout: {
    type: String,
    enum: ['single-column', 'two-column'],
    default: 'single-column'
  },
  margins: {
    top: { type: Number, default: 20, min: 0, max: 100 },
    right: { type: Number, default: 20, min: 0, max: 100 },
    bottom: { type: Number, default: 20, min: 0, max: 100 },
    left: { type: Number, default: 20, min: 0, max: 100 }
  },
  lineHeight: {
    type: Number,
    default: 1.5,
    min: 1,
    max: 2.5
  }
}, {
  _id: false,
  timestamps: false
});

const analysisSchema = new mongoose.Schema({
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  atsScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completeness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  strengths: [{
    type: String,
    trim: true
  }],
  improvements: [{
    type: String,
    trim: true
  }],
  suggestions: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  readabilityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  wordCount: {
    type: Number,
    default: 0
  },
  sectionCompleteness: {
    personalInfo: { type: Number, default: 0 },
    summary: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    skills: { type: Number, default: 0 },
    projects: { type: Number, default: 0 }
  },
  keywordMatches: [{
    keyword: String,
    count: Number,
    relevance: Number
  }],
  actionVerbsCount: Number,
  quantifiableAchievements: Number,
  lastAnalyzed: {
    type: Date,
    default: null
  }
}, {
  _id: false,
  timestamps: false
});

// ==================== MAIN RESUME SCHEMA ====================

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: 'New Resume'
  },
  slug: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  personalInfo: personalInfoSchema,
  summary: {
    type: String,
    trim: true,
    maxlength: [2000, 'Summary cannot exceed 2000 characters']
  },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  languages: [languageSchema],
  references: [{
    name: String,
    title: String,
    company: String,
    email: String,
    phone: String,
    relationship: String
  }],
  volunteerWork: [{
    organization: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String,
    hours: Number
  }],
  awards: [{
    name: String,
    issuer: String,
    date: Date,
    description: String
  }],
  publications: [{
    title: String,
    publisher: String,
    date: Date,
    link: String,
    description: String
  }],
  templateSettings: templateSettingsSchema,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'draft',
    index: true
  },
  visibility: {
    type: String,
    enum: ['private', 'unlisted', 'public'],
    default: 'private'
  },
  analysis: analysisSchema,
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPrimary: {
    type: Boolean,
    default: false
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  expiresAt: Date,
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    data: mongoose.Schema.Types.Mixed,
    createdAt: Date
  }],
  metadata: {
    createdBy: String,
    lastModifiedBy: String,
    source: String,
    aiGenerated: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== VIRTUAL PROPERTIES ====================

// Full name virtual
resumeSchema.virtual('fullName').get(function () {
  if (this.personalInfo) {
    return `${this.personalInfo.firstName || ''} ${this.personalInfo.lastName || ''}`.trim();
  }
  return '';
});

// Experience duration virtual
resumeSchema.virtual('totalExperienceYears').get(function () {
  if (!this.experience || this.experience.length === 0) return 0;

  let totalMonths = 0;
  this.experience.forEach(exp => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  });

  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
});

// Skills count by category
resumeSchema.virtual('skillsByCategory').get(function () {
  if (!this.skills) return {};

  return this.skills.reduce((acc, skill) => {
    const category = skill.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});
});

// ==================== INDEXES ====================

resumeSchema.index({ user: 1, status: 1 });
resumeSchema.index({ user: 1, updatedAt: -1 });
resumeSchema.index({ user: 1, isPrimary: 1 });
resumeSchema.index({ user: 1, isStarred: 1 });
resumeSchema.index({ tags: 1 });
resumeSchema.index({ 'analysis.score': -1 });
resumeSchema.index({ shareToken: 1 }, { unique: true, sparse: true });
resumeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ==================== PRE-SAVE MIDDLEWARE ====================

// Generate slug before saving
resumeSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    this.slug = `${baseSlug}-${Date.now().toString(36)}`;
  }

  // Update progress
  this.calculateProgress();

  next();
});

// Auto-update timestamps
resumeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  if (this.isNew) {
    // Generate share token for new resumes
    if (!this.shareToken) {
      this.shareToken = require('crypto')
        .randomBytes(16)
        .toString('hex')
        .slice(0, 32);
    }
  }

  next();
});

// Ensure only one primary resume per user
resumeSchema.pre('save', async function (next) {
  if (this.isPrimary) {
    try {
      await mongoose.model('Resume').updateMany(
        {
          user: this.user,
          _id: { $ne: this._id },
          isPrimary: true
        },
        { $set: { isPrimary: false } }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// ==================== METHODS ====================

// Calculate progress method
resumeSchema.methods.calculateProgress = function () {
  let progress = 0;
  const weights = {
    personalInfo: 20,
    summary: 15,
    experience: 25,
    education: 15,
    skills: 15,
    additional: 10
  };

  // Personal Info (need at least name and email)
  if (this.personalInfo?.firstName &&
    this.personalInfo?.lastName &&
    this.personalInfo?.email) {
    progress += weights.personalInfo;
  }

  // Summary (at least 50 characters)
  if (this.summary && this.summary.trim().length >= 50) {
    progress += weights.summary;
  }

  // Experience (at least one entry)
  if (this.experience && this.experience.length > 0) {
    progress += weights.experience;
  }

  // Education (at least one entry)
  if (this.education && this.education.length > 0) {
    progress += weights.education;
  }

  // Skills (at least 3 skills)
  if (this.skills && this.skills.length >= 3) {
    progress += weights.skills;
  }

  // Additional sections (projects, certifications, languages, etc.)
  if ((this.projects && this.projects.length > 0) ||
    (this.certifications && this.certifications.length > 0) ||
    (this.languages && this.languages.length > 0) ||
    (this.awards && this.awards.length > 0)) {
    progress += weights.additional;
  }

  this.progress = Math.min(100, Math.max(0, progress));
  return this.progress;
};

// Generate share URL
resumeSchema.methods.getShareUrl = function () {
  if (!this.shareToken) return null;
  return `${process.env.CLIENT_URL}/view/${this.shareToken}`;
};

// Duplicate resume
resumeSchema.methods.duplicate = async function (userId) {
  const duplicateData = this.toObject();

  // Remove unique fields
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;
  delete duplicateData.shareToken;
  delete duplicateData.views;
  delete duplicateData.downloads;

  // Update fields
  duplicateData.user = userId;
  duplicateData.title = `${this.title} (Copy)`;
  duplicateData.status = 'draft';
  duplicateData.isPrimary = false;
  duplicateData.isStarred = false;
  duplicateData.isPinned = false;

  // Reset analysis
  if (duplicateData.analysis) {
    duplicateData.analysis.score = 0;
    duplicateData.analysis.lastAnalyzed = null;
  }

  const Resume = mongoose.model('Resume');
  return await Resume.create(duplicateData);
};

// Export to JSON
resumeSchema.methods.toExportJSON = function () {
  const obj = this.toObject();

  // Remove internal fields
  delete obj._id;
  delete obj.__v;
  delete obj.user;
  delete obj.shareToken;
  delete obj.expiresAt;
  delete obj.previousVersions;
  delete obj.metadata;
  delete obj.views;
  delete obj.downloads;

  // Add metadata
  obj.exportedAt = new Date().toISOString();
  obj.exportVersion = '1.0';
  obj.source = 'AI Resume Builder & Analyzer';

  return obj;
};

// ==================== STATIC METHODS ====================

// Find by user with pagination
resumeSchema.statics.findByUser = function (userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    search,
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  } = options;

  const query = { user: userId };

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Search in title and personal info
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
      { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name email');
};

// Get dashboard statistics
resumeSchema.statics.getDashboardStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        published: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        drafts: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        archived: {
          $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
        },
        avgProgress: { $avg: '$progress' },
        avgScore: { $avg: '$analysis.score' },
        totalViews: { $sum: '$views' },
        totalDownloads: { $sum: '$downloads' }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0,
    avgProgress: 0,
    avgScore: 0,
    totalViews: 0,
    totalDownloads: 0
  };
};

// Find by share token
resumeSchema.statics.findByShareToken = async function (token) {
  return this.findOne({
    shareToken: token,
    status: 'published',
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// ==================== MODEL ====================

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;