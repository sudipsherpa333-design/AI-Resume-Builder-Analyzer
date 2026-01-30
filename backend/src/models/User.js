// models/User.js - COMPLETE WORKING VERSION
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: function () {
      return !this.isOAuth;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },

  // Social Authentication Fields
  googleId: {
    type: String,
    sparse: true,
    default: ''
  },
  facebookId: {
    type: String,
    sparse: true,
    default: ''
  },
  isOAuth: {
    type: Boolean,
    default: false
  },

  // Account Status
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false,
    select: false
  },

  // Resume Builder Specific Fields
  aiCredits: {
    type: Number,
    default: 150,
    min: 0
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  subscriptionEnds: Date,

  // Email Verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailVerifiedAt: Date,

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Login Tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },

  // Profile Information
  profile: {
    title: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    website: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    company: {
      type: String,
      default: ''
    },
    industry: String
  },

  // Dashboard Statistics
  dashboardStats: {
    totalResumes: {
      type: Number,
      default: 0
    },
    completedResumes: {
      type: Number,
      default: 0
    },
    draftsResumes: {
      type: Number,
      default: 0
    },
    needsWorkResumes: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    totalDownloads: {
      type: Number,
      default: 0
    },
    averageATSScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    bestATSScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastActiveResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    lastActivity: Date
  },

  // Recent Activity Log
  recentActivity: [{
    type: {
      type: String,
      enum: ['resume_created', 'resume_updated', 'resume_completed', 'ai_used', 'export', 'login', 'profile_updated']
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    title: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],

  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'zh']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'system']
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    aiSuggestions: {
      type: Boolean,
      default: true
    },
    defaultTemplate: {
      type: String,
      default: 'modern'
    }
  },

  // Usage Statistics
  usage: {
    loginCount: {
      type: Number,
      default: 0
    },
    resumeCount: {
      type: Number,
      default: 0
    },
    aiUsageCount: {
      type: Number,
      default: 0
    },
    exportCount: {
      type: Number,
      default: 0
    },
    lastResumeCreated: Date,
    lastAIAssisted: Date
  },

  // Storage Limits
  storage: {
    used: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: 104857600 // 100MB in bytes
    }
  },

  // Account flags for quick queries
  flags: {
    hasCompletedProfile: {
      type: Boolean,
      default: false
    },
    hasCreatedFirstResume: {
      type: Boolean,
      default: false
    },
    hasUsedAI: {
      type: Boolean,
      default: false
    },
    hasExportedResume: {
      type: Boolean,
      default: false
    }
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ facebookId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isSuspended: 1, isDeleted: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'dashboardStats.lastActivity': -1 });
userSchema.index({ 'usage.lastResumeCreated': -1 });
userSchema.index({ 'flags.hasCompletedProfile': 1 });
userSchema.index({ 'flags.hasCreatedFirstResume': 1 });

// Virtual for full profile URL
userSchema.virtual('profileUrl').get(function () {
  return `/api/users/${this._id}/profile`;
});

// Virtual for isLocked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for storage usage percentage
userSchema.virtual('storage.usagePercentage').get(function () {
  return Math.round((this.storage.used / this.storage.limit) * 100);
});

// Virtual for canUseAI
userSchema.virtual('canUseAI').get(function () {
  return this.aiCredits > 0 || this.plan !== 'free';
});

// Virtual for days since account creation
userSchema.virtual('accountAgeDays').get(function () {
  const createdAt = this.createdAt || new Date();
  const now = new Date();
  const diffTime = Math.abs(now - createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for plan status
userSchema.virtual('planStatus').get(function () {
  if (this.subscriptionEnds && new Date() > this.subscriptionEnds) {
    return 'expired';
  }
  return this.plan;
});

// ====================== FIXED: Pre-save middleware ======================
userSchema.pre('save', async function (next) {
  console.log('🔄 [User Model] pre-save middleware running');
  console.log('📝 Is password modified?', this.isModified('password'));
  console.log('🔑 Is OAuth?', this.isOAuth);
  console.log('📧 Email:', this.email);

  // Only hash password if it's modified and user is not OAuth
  if (!this.isModified('password') || (this.isOAuth && !this.password)) {
    console.log('⏭️ Skipping password hash');
    return next();
  }

  try {
    console.log('🔐 Hashing password for:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    console.log('🔑 Hash prefix:', this.password?.substring(0, 20) + '...');
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// Pre-save middleware to update flags
userSchema.pre('save', function (next) {
  console.log('🏷️ Updating user flags...');

  // Update profile completion flag
  this.flags.hasCompletedProfile = !!(
    this.name &&
    this.email &&
    this.profile?.title &&
    this.profile?.bio &&
    this.profile?.location
  );

  // Update first resume flag if not already set
  if (this.usage.resumeCount > 0 && !this.flags.hasCreatedFirstResume) {
    this.flags.hasCreatedFirstResume = true;
    console.log('✅ Set hasCreatedFirstResume flag');
  }

  // Update AI usage flag
  if (this.usage.aiUsageCount > 0 && !this.flags.hasUsedAI) {
    this.flags.hasUsedAI = true;
    console.log('✅ Set hasUsedAI flag');
  }

  // Update export flag
  if (this.usage.exportCount > 0 && !this.flags.hasExportedResume) {
    this.flags.hasExportedResume = true;
    console.log('✅ Set hasExportedResume flag');
  }

  next();
});

// ====================== FIXED: matchPassword method ======================
userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log('\n🔑 [User Model] matchPassword called for:', this.email);
  console.log('📝 User has password:', !!this.password);
  console.log('🔒 Is OAuth user:', this.isOAuth);

  // Check if user is OAuth-only (no password)
  if (this.isOAuth && !this.password) {
    console.log('⚠️ OAuth user trying password login');
    return false;
  }

  // Check if password exists
  if (!this.password) {
    console.log('❌ No password stored for user');
    return false;
  }

  // Check if account is locked
  if (this.isLocked) {
    console.log('🔒 Account is locked');
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }

  console.log('🔍 Comparing passwords...');
  console.log('📏 Entered password length:', enteredPassword?.length);
  console.log('🔐 Stored hash prefix:', this.password?.substring(0, 20) + '...');

  // DIRECT bcrypt comparison with error handling
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('✅ Password comparison result:', isMatch);

    if (isMatch) {
      console.log('🎉 Password matched!');

      // Reset login attempts if there were any
      if (this.loginAttempts > 0 || this.lockUntil) {
        this.loginAttempts = 0;
        this.lockUntil = undefined;
        console.log('🔄 Reset login attempts');
      }

      // Update login stats
      this.lastLogin = new Date();
      this.usage.loginCount = (this.usage?.loginCount || 0) + 1;
      this.dashboardStats.lastActivity = new Date();

      console.log('📊 Updated login stats');

      // Save user (without validation to avoid issues)
      await this.save({ validateBeforeSave: false });

      console.log('💾 User saved successfully');
    } else {
      console.log('❌ Password did not match');

      // Increment failed attempts
      this.loginAttempts = (this.loginAttempts || 0) + 1;
      console.log('📈 Failed login attempts:', this.loginAttempts);

      // Lock account after 5 failed attempts
      if (this.loginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        console.log('🔒 Account locked until:', this.lockUntil);
      }

      await this.save({ validateBeforeSave: false });
    }

    return isMatch;

  } catch (bcryptError) {
    console.error('❌ Bcrypt comparison error:', bcryptError);
    return false;
  }
};

// ====================== OTHER METHODS (Keep as is) ======================

userSchema.methods.updateResumeCount = async function () {
  try {
    const Resume = mongoose.model('Resume');
    const count = await Resume.countDocuments({
      user: this._id,
      isDeleted: { $ne: true }
    });

    this.usage.resumeCount = count;
    this.dashboardStats.totalResumes = count;

    // Update first resume flag
    if (count > 0 && !this.flags.hasCreatedFirstResume) {
      this.flags.hasCreatedFirstResume = true;
    }

    // Update last resume created date if we have resumes
    if (count > 0) {
      const latestResume = await Resume.findOne({ user: this._id })
        .sort({ createdAt: -1 })
        .select('createdAt');

      if (latestResume) {
        this.usage.lastResumeCreated = latestResume.createdAt;
      }
    }

    await this.save({ validateBeforeSave: false });
    return count;

  } catch (error) {
    console.error('Error updating resume count:', error);
    throw error;
  }
};

userSchema.methods.addActivity = function (activity) {
  // Keep only last 50 activities
  this.recentActivity.unshift({
    ...activity,
    timestamp: new Date()
  });

  if (this.recentActivity.length > 50) {
    this.recentActivity = this.recentActivity.slice(0, 50);
  }

  this.dashboardStats.lastActivity = new Date();
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.updateDashboardStats = async function (resumes = []) {
  try {
    const stats = {
      totalResumes: resumes.length,
      completedResumes: resumes.filter(r => r.status === 'completed').length,
      draftsResumes: resumes.filter(r => r.status === 'draft').length,
      needsWorkResumes: resumes.filter(r => r.status === 'needs_work').length,
      totalViews: resumes.reduce((sum, r) => sum + (r.views || 0), 0),
      totalDownloads: resumes.reduce((sum, r) => sum + (r.downloads || 0), 0)
    };

    // Calculate average ATS score
    const scores = resumes
      .filter(r => r.analysis?.atsScore)
      .map(r => r.analysis.atsScore);

    stats.averageATSScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    stats.bestATSScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Update last active resume (most recently updated)
    const latestResume = resumes.sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    )[0];

    if (latestResume) {
      stats.lastActiveResume = latestResume._id;
    }

    this.dashboardStats = { ...this.dashboardStats, ...stats };
    await this.save({ validateBeforeSave: false });

    return this.dashboardStats;

  } catch (error) {
    console.error('Error updating dashboard stats:', error);
    throw error;
  }
};

userSchema.methods.generateVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return verificationToken;
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
  return resetToken;
};

userSchema.methods.useAICredits = async function (credits = 1) {
  if (this.aiCredits < credits && this.plan === 'free') {
    throw new Error('Insufficient AI credits. Please upgrade your plan or purchase more credits.');
  }

  this.aiCredits -= credits;
  this.usage.aiUsageCount += credits;
  this.usage.lastAIAssisted = new Date();

  if (!this.flags.hasUsedAI) {
    this.flags.hasUsedAI = true;
  }

  await this.addActivity({
    type: 'ai_used',
    description: `Used ${credits} AI credit${credits > 1 ? 's' : ''}`,
    metadata: { credits }
  });

  await this.save({ validateBeforeSave: false });

  return this.aiCredits;
};

userSchema.methods.addAICredits = async function (credits) {
  this.aiCredits += credits;

  await this.addActivity({
    type: 'ai_used',
    description: `Added ${credits} AI credit${credits > 1 ? 's' : ''}`,
    metadata: { credits, action: 'add' }
  });

  await this.save({ validateBeforeSave: false });
  return this.aiCredits;
};

userSchema.methods.updateStorageUsage = async function (sizeInBytes) {
  this.storage.used += sizeInBytes;

  if (this.storage.used > this.storage.limit) {
    throw new Error('Storage limit exceeded. Please upgrade your plan to increase storage.');
  }

  await this.save({ validateBeforeSave: false });
  return this.storage.used;
};

userSchema.methods.updateProfile = async function (profileData) {
  this.profile = { ...this.profile, ...profileData };

  await this.addActivity({
    type: 'profile_updated',
    description: 'Profile information updated',
    metadata: { fields: Object.keys(profileData) }
  });

  await this.save();
  return this;
};

userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    avatar: this.avatar,
    profile: this.profile,
    flags: this.flags,
    dashboardStats: {
      totalResumes: this.dashboardStats.totalResumes,
      averageATSScore: this.dashboardStats.averageATSScore,
      bestATSScore: this.dashboardStats.bestATSScore
    }
  };
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true, isSuspended: false, isDeleted: false });
};

userSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    {
      $match: {
        isDeleted: false,
        isSuspended: false
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
        totalResumes: { $sum: '$usage.resumeCount' },
        totalAICreditsUsed: { $sum: '$usage.aiUsageCount' },
        averageATSScore: { $avg: '$dashboardStats.averageATSScore' },
        planDistribution: {
          $push: '$plan'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalUsers: 1,
        activeUsers: 1,
        verifiedUsers: 1,
        totalResumes: 1,
        totalAICreditsUsed: 1,
        averageATSScore: { $round: ['$averageATSScore', 2] },
        planDistribution: {
          free: { $size: { $filter: { input: '$planDistribution', as: 'plan', cond: { $eq: ['$$plan', 'free'] } } } },
          pro: { $size: { $filter: { input: '$planDistribution', as: 'plan', cond: { $eq: ['$$plan', 'pro'] } } } },
          enterprise: { $size: { $filter: { input: '$planDistribution', as: 'plan', cond: { $eq: ['$$plan', 'enterprise'] } } } }
        }
      }
    }
  ]);

  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    totalResumes: 0,
    totalAICreditsUsed: 0,
    averageATSScore: 0,
    planDistribution: { free: 0, pro: 0, enterprise: 0 }
  };
};

// Create the model
const User = mongoose.model('User', userSchema);

export default User;