import mongoose from "mongoose";

// Experience Schema
const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  startDate: String,
  endDate: String,
  current: {
    type: Boolean,
    default: false
  },
  description: String,
  location: String,
  achievements: [String],
  skills: [String]
}, {
  _id: true,
  timestamps: false
});

// Education Schema
const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  field: String,
  startDate: String,
  endDate: String,
  current: {
    type: Boolean,
    default: false
  },
  gpa: String,
  location: String,
  honors: [String],
  relevantCourses: [String]
}, {
  _id: true,
  timestamps: false
});

// Skill Schema
const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  category: {
    type: String,
    enum: ['Technical', 'Soft Skills', 'Tools', 'Languages', 'Certifications', 'Other'],
    default: 'Technical'
  },
  yearsOfExperience: Number
}, {
  _id: true,
  timestamps: false
});

// Project Schema
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: [String],
  link: String,
  startDate: String,
  endDate: String,
  current: {
    type: Boolean,
    default: false
  },
  role: String,
  outcomes: [String]
}, {
  _id: true,
  timestamps: false
});

// Personal Info Schema
const personalInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: String,
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,
  linkedin: String,
  github: String,
  portfolio: String,
  website: String,
  summary: String,
  objective: String,
  jobTitle: String,
  industry: String
}, {
  _id: false,
  timestamps: false
});

// Certification Schema
const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  issuer: String,
  date: String,
  credentialId: String,
  credentialUrl: String,
  expires: String
}, {
  _id: true,
  timestamps: false
});

// Language Schema
const languageSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    trim: true
  },
  proficiency: {
    type: String,
    enum: ['Basic', 'Conversational', 'Professional', 'Native'],
    default: 'Professional'
  }
}, {
  _id: true,
  timestamps: false
});

// Analysis Schema
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
  strengths: [String],
  improvements: [String],
  suggestions: [String],
  keywords: [String],
  industryMatch: String,
  readabilityScore: Number,
  wordCount: Number,
  characterCount: Number,
  missingSections: [String],
  lastAnalyzed: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false,
  timestamps: false
});

// Template Settings Schema
const templateSettingsSchema = new mongoose.Schema({
  templateName: {
    type: String,
    default: 'modern',
    enum: ['modern', 'classic', 'creative', 'minimal', 'professional', 'elegant']
  },
  colors: {
    primary: { type: String, default: '#3b82f6' },
    secondary: { type: String, default: '#6b7280' },
    accent: { type: String, default: '#10b981' },
    background: { type: String, default: '#ffffff' },
    text: { type: String, default: '#000000' }
  },
  font: {
    type: String,
    default: 'Roboto',
    enum: ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Merriweather', 'Arial', 'Times New Roman']
  },
  fontSize: {
    type: String,
    default: 'medium',
    enum: ['small', 'medium', 'large']
  },
  spacing: {
    type: String,
    default: 'normal',
    enum: ['compact', 'normal', 'relaxed']
  },
  showPhoto: {
    type: Boolean,
    default: false
  }
}, {
  _id: false,
  timestamps: false
});

// Sharing Settings Schema
const sharingSchema = new mongoose.Schema({
  publicUrl: String,
  qrCode: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  password: String,
  expiresAt: Date,
  lastShared: Date,
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  _id: false,
  timestamps: false
});

// Main Resume Schema
const resumeSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Resume metadata
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'My Resume'
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  version: {
    type: Number,
    default: 1
  },

  // Resume content
  personalInfo: personalInfoSchema,
  summary: {
    type: String,
    default: ''
  },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  languages: [languageSchema],
  awards: [{
    name: String,
    issuer: String,
    date: String,
    description: String
  }],
  references: [{
    name: String,
    title: String,
    company: String,
    email: String,
    phone: String
  }],

  // Resume analysis
  analysis: analysisSchema,

  // Template and styling
  templateSettings: templateSettingsSchema,

  // Sharing settings
  sharing: sharingSchema,

  // Status and visibility
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'needs_work', 'archived'],
    default: 'draft'
  },
  isPrimary: {
    type: Boolean,
    default: false
  },

  // AI Generated content
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String,
  aiEnhancements: {
    count: { type: Number, default: 0 },
    lastEnhanced: Date,
    sections: [String]
  },

  // Analytics
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  lastViewed: Date,
  lastEdited: Date,
  analyzedAt: Date,

  // Version control
  history: [{
    action: String,
    section: String,
    data: Object,
    timestamp: {
      type: Date,
      default: Date.now
    },
    userAgent: String
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ user: 1, status: 1 });
resumeSchema.index({ user: 1, isPrimary: 1 });
resumeSchema.index({ slug: 1 });
resumeSchema.index({ title: 'text', 'personalInfo.summary': 'text', 'personalInfo.jobTitle': 'text' });
resumeSchema.index({ status: 1, updatedAt: -1 });
resumeSchema.index({ 'analysis.atsScore': -1 });
resumeSchema.index({ 'sharing.isPublic': 1 });

// Virtual for full name
resumeSchema.virtual('fullName').get(function () {
  if (this.personalInfo) {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`.trim();
  }
  return '';
});

// Virtual for total experience years
resumeSchema.virtual('totalExperienceYears').get(function () {
  if (!this.experience || this.experience.length === 0) return 0;

  let totalMonths = 0;

  this.experience.forEach(exp => {
    if (exp.startDate) {
      const start = parseDate(exp.startDate);
      let end = exp.current ? new Date() : parseDate(exp.endDate);

      if (start && end) {
        const months = (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    }
  });

  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
});

// Virtual for progress percentage
resumeSchema.virtual('progress').get(function () {
  const sections = ['personalInfo', 'summary', 'experience', 'education', 'skills'];
  let completed = 0;

  sections.forEach(section => {
    if (this.isSectionComplete(section)) {
      completed++;
    }
  });

  return Math.round((completed / sections.length) * 100);
});

// Method to check if section is complete
resumeSchema.methods.isSectionComplete = function (section) {
  switch (section) {
    case 'personalInfo':
      return !!(this.personalInfo?.firstName &&
        this.personalInfo?.lastName &&
        this.personalInfo?.email &&
        this.personalInfo?.jobTitle);
    case 'summary':
      return !!(this.summary && this.summary.trim().length > 100);
    case 'experience':
      return Array.isArray(this.experience) && this.experience.length > 0;
    case 'education':
      return Array.isArray(this.education) && this.education.length > 0;
    case 'skills':
      return Array.isArray(this.skills) && this.skills.length >= 5;
    default:
      return true;
  }
};

// Pre-save middleware to generate slug
resumeSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const randomStr = Math.random().toString(36).substring(2, 8);
    this.slug = `${baseSlug}-${randomStr}`;
  }

  // Update lastEdited timestamp
  this.lastEdited = new Date();

  // Auto-calculate ATS score if not set
  if (!this.analysis?.atsScore || this.isModified()) {
    this.calculateATS();
  }

  next();
});

// Pre-save middleware to ensure only one primary resume per user
resumeSchema.pre('save', async function (next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    try {
      await this.constructor.updateMany(
        {
          user: this.user,
          _id: { $ne: this._id }
        },
        { $set: { isPrimary: false } }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Calculate ATS score
resumeSchema.methods.calculateATS = function () {
  let score = 50; // Base score

  // Check personal info
  if (this.personalInfo?.firstName && this.personalInfo?.lastName) score += 10;
  if (this.personalInfo?.email) score += 5;
  if (this.personalInfo?.phone) score += 5;

  // Check summary
  if (this.summary && this.summary.trim().length > 100) score += 10;

  // Check experience
  if (Array.isArray(this.experience) && this.experience.length > 0) {
    score += Math.min(this.experience.length * 5, 20);
  }

  // Check education
  if (Array.isArray(this.education) && this.education.length > 0) {
    score += Math.min(this.education.length * 5, 15);
  }

  // Check skills
  if (Array.isArray(this.skills) && this.skills.length >= 5) {
    score += 10;
  }

  // Check for keywords (simplified)
  const resumeText = JSON.stringify(this).toLowerCase();
  const keywords = ['javascript', 'react', 'node.js', 'python', 'java', 'sql', 'aws', 'docker'];
  const foundKeywords = keywords.filter(keyword => resumeText.includes(keyword));
  score += Math.min(foundKeywords.length * 2, 10);

  // Cap score
  score = Math.min(score, 100);

  if (!this.analysis) {
    this.analysis = {};
  }
  this.analysis.atsScore = score;
  this.analysis.lastAnalyzed = new Date();
  this.analyzedAt = new Date();

  return score;
};

// Method to add to history
resumeSchema.methods.addHistory = function (action, section, data = null) {
  this.history.unshift({
    action,
    section,
    data,
    timestamp: new Date(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
  });

  // Keep only last 100 entries
  if (this.history.length > 100) {
    this.history = this.history.slice(0, 100);
  }
};

// Method to duplicate resume
resumeSchema.methods.duplicate = async function () {
  const duplicatedResume = this.toObject();
  delete duplicatedResume._id;
  delete duplicatedResume.slug;
  delete duplicatedResume.history;

  duplicatedResume.title = `${this.title} (Copy)`;
  duplicatedResume.isPrimary = false;
  duplicatedResume.views = 0;
  duplicatedResume.downloads = 0;
  duplicatedResume.createdAt = new Date();
  duplicatedResume.updatedAt = new Date();

  return await this.constructor.create(duplicatedResume);
};

// Method to export resume as JSON
resumeSchema.methods.exportAsJSON = function () {
  const resumeData = this.toObject();

  // Remove internal fields
  delete resumeData._id;
  delete resumeData.user;
  delete resumeData.__v;
  delete resumeData.createdAt;
  delete resumeData.updatedAt;
  delete resumeData.slug;
  delete resumeData.isPrimary;
  delete resumeData.views;
  delete resumeData.downloads;
  delete resumeData.lastViewed;
  delete resumeData.lastEdited;
  delete resumeData.analyzedAt;
  delete resumeData.history;
  delete resumeData.sharing;

  return resumeData;
};

// Method to update analysis
resumeSchema.methods.updateAnalysis = function (analysisData) {
  this.analysis = {
    ...this.analysis,
    ...analysisData,
    lastAnalyzed: new Date()
  };
  this.analyzedAt = new Date();
  return this.save();
};

// Method to increment views
resumeSchema.methods.incrementViews = function () {
  this.views += 1;
  this.lastViewed = new Date();
  return this.save();
};

// Method to increment downloads
resumeSchema.methods.incrementDownloads = function () {
  this.downloads += 1;
  return this.save();
};

// Helper function to parse dates
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Try parsing different date formats
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;