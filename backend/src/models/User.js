// models/User.js - COMPLETE FIXED VERSION
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
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
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
    inProgressResumes: {
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
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },

  // Recent Activity Log
  recentActivity: [{
    type: {
      type: String,
      enum: ['resume_created', 'resume_updated', 'resume_completed', 'ai_used', 'export', 'login', 'profile_updated', 'account_created']
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

// ======================
// INDEXES
// ======================

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isSuspended: 1, isDeleted: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'dashboardStats.lastActivity': -1 });
userSchema.index({ 'usage.lastResumeCreated': -1 });

// ======================
// VIRTUAL PROPERTIES
// ======================

userSchema.virtual('profileUrl').get(function () {
  return `/api/users/${this._id}/profile`;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('storage.usagePercentage').get(function () {
  if (!this.storage.limit || this.storage.limit === 0) return 0;
  return Math.round((this.storage.used / this.storage.limit) * 100);
});

// ✅ KEEP ONLY VIRTUAL PROPERTY (removed duplicate method)
userSchema.virtual('canUseAI').get(function () {
  return this.aiCredits > 0 || this.plan !== 'free';
});

userSchema.virtual('accountAgeDays').get(function () {
  const createdAt = this.createdAt || new Date();
  const now = new Date();
  const diffTime = Math.abs(now - createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

userSchema.virtual('planStatus').get(function () {
  if (this.subscriptionEnds && new Date() > this.subscriptionEnds) {
    return 'expired';
  }
  return this.plan;
});

// ======================
// MIDDLEWARE
// ======================

// Pre-save: Hash password
userSchema.pre('save', async function (next) {
  console.log('🔄 [User Model] pre-save middleware running');

  // Skip for OAuth users without password
  if (this.isOAuth && !this.password) {
    console.log('⏭️ OAuth user without password - skipping hash');
    return next();
  }

  // Only hash password if it's modified
  if (!this.isModified('password')) {
    console.log('⏭️ Password not modified - skipping hash');
    return next();
  }

  try {
    console.log('🔐 Hashing password for:', this.email);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// Pre-save: Update flags and activity
userSchema.pre('save', function (next) {
  console.log('🏷️ Updating user flags and stats...');

  // Update profile completion flag
  this.flags.hasCompletedProfile = !!(
    this.name &&
    this.email &&
    this.profile?.title &&
    this.profile?.bio &&
    this.profile?.location
  );

  // Update other flags based on usage
  if (this.usage?.resumeCount > 0 && !this.flags.hasCreatedFirstResume) {
    this.flags.hasCreatedFirstResume = true;
  }

  if (this.usage?.aiUsageCount > 0 && !this.flags.hasUsedAI) {
    this.flags.hasUsedAI = true;
  }

  if (this.usage?.exportCount > 0 && !this.flags.hasExportedResume) {
    this.flags.hasExportedResume = true;
  }

  // Add activity for new user creation
  if (this.isNew) {
    this.recentActivity = [{
      type: 'account_created',
      description: 'Account created successfully',
      timestamp: new Date()
    }];
  }

  next();
});

// ======================
// INSTANCE METHODS
// ======================

/**
 * Compare entered password with stored hash
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  console.log('\n🔑 [User Model] comparePassword called');
  console.log('📧 User email:', this.email);
  console.log('🔒 Is OAuth user:', this.isOAuth);
  console.log('🔑 Password exists:', !!this.password);

  if (!this.password) {
    console.log('❌ No password stored for user');
    throw new Error('No password set for this account');
  }

  if (this.isLocked) {
    console.log('🔒 Account is temporarily locked');
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }

  try {
    console.log('🔍 Comparing passwords...');
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('✅ Password comparison result:', isMatch);

    if (isMatch) {
      // Reset login attempts
      this.loginAttempts = 0;
      this.lockUntil = undefined;
      this.lastLogin = new Date();

      // Update usage stats
      this.usage.loginCount = (this.usage.loginCount || 0) + 1;
      this.dashboardStats.lastActivity = new Date();

      // Add login activity
      this.recentActivity = this.recentActivity || [];
      this.recentActivity.unshift({
        type: 'login',
        description: 'Logged in successfully',
        timestamp: new Date()
      });

      // Keep only last 20 activities
      if (this.recentActivity.length > 20) {
        this.recentActivity = this.recentActivity.slice(0, 20);
      }

      await this.save({ validateBeforeSave: false });
      console.log('💾 User saved after successful login');
    } else {
      // Increment failed attempts
      this.loginAttempts = (this.loginAttempts || 0) + 1;
      console.log('❌ Failed login attempt:', this.loginAttempts);

      // Lock account after 5 failed attempts
      if (this.loginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        console.log('🔒 Account locked until:', this.lockUntil);
      }

      await this.save({ validateBeforeSave: false });
    }

    return isMatch;
  } catch (error) {
    console.error('❌ Bcrypt comparison error:', error);
    throw error;
  }
};

/**
 * Alias for comparePassword (backward compatibility)
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return this.comparePassword(enteredPassword);
};

/**
 * Generate password reset token
 */
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

/**
 * Generate email verification token
 */
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

/**
 * Update resume count and related stats
 */
userSchema.methods.updateResumeCount = async function () {
  try {
    const Resume = mongoose.model('Resume');
    const count = await Resume.countDocuments({
      user: this._id,
      isDeleted: { $ne: true }
    });

    this.usage.resumeCount = count;
    this.dashboardStats.totalResumes = count;

    if (count > 0 && !this.flags.hasCreatedFirstResume) {
      this.flags.hasCreatedFirstResume = true;
    }

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

/**
 * Add activity to user's recent activity log
 */
userSchema.methods.addActivity = async function (activity) {
  try {
    this.recentActivity = this.recentActivity || [];
    this.recentActivity.unshift({
      ...activity,
      timestamp: new Date()
    });

    if (this.recentActivity.length > 50) {
      this.recentActivity = this.recentActivity.slice(0, 50);
    }

    this.dashboardStats.lastActivity = new Date();
    await this.save({ validateBeforeSave: false });

    return this;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};

/**
 * Update dashboard statistics based on resumes
 */
userSchema.methods.updateDashboardStats = async function (resumes = []) {
  try {
    const stats = {
      totalResumes: resumes.length,
      completedResumes: resumes.filter(r => r.status === 'completed').length,
      draftsResumes: resumes.filter(r => r.status === 'draft').length,
      inProgressResumes: resumes.filter(r => r.status === 'in-progress').length,
      totalViews: resumes.reduce((sum, r) => sum + (r.views || 0), 0),
      totalDownloads: resumes.reduce((sum, r) => sum + (r.downloads || 0), 0)
    };

    const scores = resumes
      .filter(r => r.analysis?.atsScore)
      .map(r => r.analysis.atsScore);

    stats.averageATSScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    stats.bestATSScore = scores.length > 0 ? Math.max(...scores) : 0;

    if (resumes.length > 0) {
      const latestResume = resumes.sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )[0];
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

/**
 * Check if user can use AI features - REMOVED (now using virtual property)
 * Use: user.canUseAI (not user.canUseAI())
 */

/**
 * Consume AI credits
 */
userSchema.methods.consumeAICredits = async function (amount = 1) {
  if (this.plan === 'free') {
    if (this.aiCredits < amount) {
      throw new Error('Insufficient AI credits');
    }
    this.aiCredits -= amount;
  }

  this.usage.aiUsageCount = (this.usage.aiUsageCount || 0) + 1;
  this.usage.lastAIAssisted = new Date();

  if (!this.flags.hasUsedAI) {
    this.flags.hasUsedAI = true;
  }

  await this.save({ validateBeforeSave: false });
  return this.aiCredits;
};

/**
 * Get user profile completion percentage
 */
userSchema.methods.getProfileCompletion = function () {
  const fields = [
    'name',
    'email',
    'profile.title',
    'profile.bio',
    'profile.location',
    'avatar'
  ];

  let completed = 0;
  fields.forEach(field => {
    if (this.get(field)) completed++;
  });

  return Math.round((completed / fields.length) * 100);
};

/**
 * Check if user storage is within limits
 */
userSchema.methods.checkStorageLimit = function (additionalBytes = 0) {
  const totalUsed = this.storage.used + additionalBytes;
  return totalUsed <= this.storage.limit;
};

/**
 * Add storage usage
 */
userSchema.methods.addStorageUsage = async function (bytes) {
  if (!this.checkStorageLimit(bytes)) {
    throw new Error('Storage limit exceeded');
  }

  this.storage.used += bytes;
  await this.save({ validateBeforeSave: false });
  return this.storage.used;
};

// ======================
// STATIC METHODS
// ======================

/**
 * Find user by email (case-insensitive)
 */
userSchema.statics.findByEmail = async function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find user by Google ID
 */
userSchema.statics.findByGoogleId = async function (googleId) {
  return this.findOne({ googleId });
};

/**
 * Find or create user from Google OAuth
 */
userSchema.statics.findOrCreateFromGoogle = async function (googleData) {
  const { sub: googleId, email, name, picture } = googleData;

  let user = await this.findOne({
    $or: [
      { email: email.toLowerCase() },
      { googleId }
    ]
  });

  if (!user) {
    user = new this({
      name,
      email: email.toLowerCase(),
      avatar: picture,
      googleId,
      provider: 'google',
      isOAuth: true,
      isVerified: true,
      emailVerifiedAt: new Date()
    });
    await user.save();
  } else {
    // Update existing user
    user.name = name;
    user.avatar = picture;
    user.googleId = googleId;
    user.provider = 'google';
    user.isOAuth = true;
    user.isVerified = true;
    user.emailVerifiedAt = new Date();
    user.lastLogin = new Date();
    await user.save();
  }

  return user;
};

/**
 * Get all active users
 */
userSchema.statics.getActiveUsers = async function () {
  return this.find({
    isActive: true,
    isSuspended: false,
    isDeleted: false
  });
};

/**
 * Get user stats for admin dashboard
 */
userSchema.statics.getAdminStats = async function () {
  const totalUsers = await this.countDocuments({ isDeleted: false });
  const activeUsers = await this.countDocuments({
    isActive: true,
    isSuspended: false,
    isDeleted: false
  });
  const googleUsers = await this.countDocuments({ provider: 'google' });
  const verifiedUsers = await this.countDocuments({ isVerified: true });

  return {
    totalUsers,
    activeUsers,
    googleUsers,
    verifiedUsers,
    verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0
  };
};

// ======================
// QUERY HELPERS
// ======================

userSchema.query.active = function () {
  return this.where({
    isActive: true,
    isSuspended: false,
    isDeleted: false
  });
};

userSchema.query.withResumeStats = function () {
  return this.where('dashboardStats.totalResumes').gt(0);
};

userSchema.query.recentlyActive = function (days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.where('dashboardStats.lastActivity').gte(date);
};

// Create the model
const User = mongoose.model('User', userSchema);

export default User;