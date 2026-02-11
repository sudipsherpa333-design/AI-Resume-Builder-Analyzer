// src/services/resumeService.js
import apiService from './api';
import { toast } from 'react-hot-toast';

class ResumeService {
  constructor() {
    this.cache = new Map();
    this.autoSaveQueue = new Map();
    this.autoSaveTimer = null;
    this.MAX_CACHE_SIZE = 50;
  }

  // ==================== RESUME CRUD OPERATIONS ====================

  /**
   * Create a new resume
   * @param {Object} resumeData - Resume data
   * @param {boolean} isTemplate - Whether creating from template
   * @returns {Promise<Object>} Created resume
   */
  async createResume(resumeData, isTemplate = false) {
    try {
      console.log('📝 Creating new resume...', { resumeData, isTemplate });

      // Get current user
      const user = apiService.auth.getCurrentUser();
      if (!user || !user.id) {
        throw new Error('User authentication required');
      }

      // Prepare data with user ID
      const dataToSend = {
        ...resumeData,
        userId: user.id,
        status: 'draft',
        isTemplate: isTemplate,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create resume
      const response = await apiService.resume.createResume(dataToSend);

      if (response) {
        const resume = response.data || response;

        // Cache the new resume
        this.cacheResume(resume);

        // Show success message
        toast.success(isTemplate ? 'Template created successfully!' : 'Resume created successfully!');

        // Track analytics if available
        this.trackEvent('resume_created', {
          resumeId: resume._id || resume.id,
          isTemplate,
          template: resume.template
        });

        return resume;
      }

      throw new Error('Failed to create resume');
    } catch (error) {
      console.error('❌ Error creating resume:', error);
      toast.error(error.message || 'Failed to create resume');
      throw error;
    }
  }

  /**
   * Get a single resume by ID
   * @param {string} resumeId - Resume ID
   * @param {boolean} forceRefresh - Skip cache
   * @returns {Promise<Object>} Resume data
   */
  async getResume(resumeId, forceRefresh = false) {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required');
      }

      // Check cache first
      if (!forceRefresh && this.cache.has(resumeId)) {
        console.log('📦 Serving resume from cache:', resumeId);
        return this.cache.get(resumeId);
      }

      console.log('📥 Fetching resume:', resumeId);

      // Fetch from API
      const response = await apiService.resume.getResume(resumeId);

      if (response) {
        const resume = response.data || response;

        // Cache the resume
        this.cacheResume(resume);

        return resume;
      }

      throw new Error('Resume not found');
    } catch (error) {
      console.error('❌ Error fetching resume:', error);

      // If we have cached data, return it even on error
      if (this.cache.has(resumeId)) {
        console.warn('⚠️ Using cached resume data due to fetch error');
        return this.cache.get(resumeId);
      }

      throw error;
    }
  }

  /**
   * Get all resumes for current user
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of resumes
   */
  async getUserResumes(options = {}) {
    try {
      const {
        status = null,
        limit = 100,
        skip = 0,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        search = '',
        forceRefresh = false
      } = options;

      console.log('📥 Fetching user resumes with options:', options);

      // Get current user
      const user = apiService.auth.getCurrentUser();
      if (!user || !user.id) {
        console.warn('⚠️ No user found, returning empty list');
        return [];
      }

      // Check for cached user resumes
      const cacheKey = `user_${user.id}_${JSON.stringify(options)}`;
      if (!forceRefresh && this.cache.has(cacheKey)) {
        console.log('📦 Serving user resumes from cache');
        return this.cache.get(cacheKey);
      }

      // Fetch from API
      let resumes = [];
      try {
        // Try main endpoint first
        const response = await apiService.resume.getUserResumes(user.id);
        resumes = Array.isArray(response) ? response : response.data || [];
      } catch (error) {
        // Fallback to my-resumes endpoint
        console.log('🔄 Falling back to my-resumes endpoint');
        try {
          const response = await apiService.resume.getMyResumes();
          resumes = Array.isArray(response) ? response : response.data || [];
        } catch (fallbackError) {
          console.error('❌ Both endpoints failed:', fallbackError);
          resumes = [];
        }
      }

      // Apply filters
      let filteredResumes = [...resumes];

      // Filter by status
      if (status) {
        filteredResumes = filteredResumes.filter(r => r.status === status);
      }

      // Filter by search term
      if (search) {
        const searchLower = search.toLowerCase();
        filteredResumes = filteredResumes.filter(r =>
          (r.title && r.title.toLowerCase().includes(searchLower)) ||
          (r.personalInfo?.fullName && r.personalInfo.fullName.toLowerCase().includes(searchLower)) ||
          (r.tags && r.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }

      // Sort resumes
      filteredResumes.sort((a, b) => {
        const aValue = a[sortBy] || 0;
        const bValue = b[sortBy] || 0;

        if (sortOrder === 'desc') {
          return new Date(bValue) - new Date(aValue);
        }
        return new Date(aValue) - new Date(bValue);
      });

      // Apply pagination
      const paginatedResumes = filteredResumes.slice(skip, skip + limit);

      // Cache individual resumes
      resumes.forEach(resume => this.cacheResume(resume));

      // Cache filtered result
      this.cache.set(cacheKey, paginatedResumes);

      console.log(`✅ Found ${filteredResumes.length} resumes (showing ${paginatedResumes.length})`);
      return paginatedResumes;
    } catch (error) {
      console.error('❌ Error fetching user resumes:', error);
      toast.error('Failed to load resumes');
      return [];
    }
  }

  /**
   * Update a resume
   * @param {string} resumeId - Resume ID
   * @param {Object} updateData - Data to update
   * @param {boolean} silent - Don't show toast
   * @returns {Promise<Object>} Updated resume
   */
  async updateResume(resumeId, updateData, silent = false) {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required');
      }

      console.log('📝 Updating resume:', resumeId, updateData);

      // Prepare update data
      const dataToSend = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      // Update via API
      const response = await apiService.resume.updateResume(resumeId, dataToSend);

      if (response) {
        const updatedResume = response.data || response;

        // Update cache
        this.cacheResume(updatedResume);

        // Invalidate user resumes cache
        this.invalidateUserCache();

        if (!silent) {
          toast.success('Resume updated successfully!');
        }

        // Track update
        this.trackEvent('resume_updated', {
          resumeId,
          fields: Object.keys(updateData)
        });

        return updatedResume;
      }

      throw new Error('Failed to update resume');
    } catch (error) {
      console.error('❌ Error updating resume:', error);
      if (!silent) {
        toast.error(error.message || 'Failed to update resume');
      }
      throw error;
    }
  }

  /**
   * Partial update of a resume
   * @param {string} resumeId - Resume ID
   * @param {Object} updateData - Partial data to update
   * @returns {Promise<Object>} Updated resume
   */
  async patchResume(resumeId, updateData) {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required');
      }

      console.log('📝 Patching resume:', resumeId, updateData);

      // Add timestamp
      const dataToSend = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      // Patch via API
      const response = await apiService.resume.patchResume(resumeId, dataToSend);

      if (response) {
        const updatedResume = response.data || response;

        // Update cache
        this.cacheResume(updatedResume);

        // Invalidate user resumes cache
        this.invalidateUserCache();

        return updatedResume;
      }

      throw new Error('Failed to patch resume');
    } catch (error) {
      console.error('❌ Error patching resume:', error);
      throw error;
    }
  }

  /**
   * Delete a resume
   * @param {string} resumeId - Resume ID
   * @param {boolean} confirm - Require confirmation
   * @returns {Promise<boolean>} Success status
   */
  async deleteResume(resumeId, confirm = true) {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required');
      }

      // Ask for confirmation
      if (confirm && !window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
        return false;
      }

      console.log('🗑️ Deleting resume:', resumeId);

      // Delete via API
      const response = await apiService.resume.deleteResume(resumeId);

      if (response) {
        // Remove from cache
        this.cache.delete(resumeId);

        // Invalidate user resumes cache
        this.invalidateUserCache();

        // Clear auto-save queue for this resume
        this.autoSaveQueue.delete(resumeId);

        toast.success('Resume deleted successfully!');

        // Track deletion
        this.trackEvent('resume_deleted', { resumeId });

        return true;
      }

      throw new Error('Failed to delete resume');
    } catch (error) {
      console.error('❌ Error deleting resume:', error);
      toast.error(error.message || 'Failed to delete resume');
      throw error;
    }
  }

  // ==================== AUTO-SAVE FUNCTIONALITY ====================

  /**
   * Queue resume for auto-save
   * @param {string} resumeId - Resume ID
   * @param {Object} resumeData - Resume data to save
   */
  async queueAutoSave(resumeId, resumeData) {
    if (!resumeId || !resumeData) return;

    // Update cache immediately for responsive UI
    this.cacheResume(resumeData);

    // Add to queue with timestamp
    this.autoSaveQueue.set(resumeId, {
      data: resumeData,
      timestamp: Date.now(),
      attempts: 0
    });

    // Start auto-save timer if not already running
    if (!this.autoSaveTimer) {
      this.autoSaveTimer = setTimeout(() => this.processAutoSaveQueue(), 2000);
    }
  }

  /**
   * Process the auto-save queue
   */
  async processAutoSaveQueue() {
    if (this.autoSaveQueue.size === 0) {
      this.autoSaveTimer = null;
      return;
    }

    const queueEntries = Array.from(this.autoSaveQueue.entries());

    for (const [resumeId, queueItem] of queueEntries) {
      try {
        console.log('💾 Auto-saving resume:', resumeId);

        const response = await apiService.resume.autoSaveResume(resumeId, queueItem.data);

        if (response) {
          // Success - remove from queue
          this.autoSaveQueue.delete(resumeId);

          // Update cache with server response
          const savedResume = response.data || response;
          this.cacheResume(savedResume);

          console.log('✅ Auto-save successful:', resumeId);
        }
      } catch (error) {
        console.warn('⚠️ Auto-save failed:', resumeId, error.message);

        // Increment attempts
        queueItem.attempts++;

        // Remove from queue after too many attempts
        if (queueItem.attempts >= 3) {
          console.error('❌ Giving up on auto-save after 3 attempts:', resumeId);
          this.autoSaveQueue.delete(resumeId);

          toast.error('Auto-save failed. Please save manually.');
        }
      }
    }

    // Schedule next batch if queue not empty
    if (this.autoSaveQueue.size > 0) {
      this.autoSaveTimer = setTimeout(() => this.processAutoSaveQueue(), 3000);
    } else {
      this.autoSaveTimer = null;
    }
  }

  /**
   * Save a specific resume section
   * @param {string} resumeId - Resume ID
   * @param {string} section - Section name
   * @param {Object} data - Section data
   * @returns {Promise<Object>} Updated resume
   */
  async saveResumeSection(resumeId, section, data) {
    try {
      if (!resumeId || !section) {
        throw new Error('Resume ID and section are required');
      }

      console.log('📝 Saving resume section:', { resumeId, section });

      // Get current resume from cache
      const currentResume = this.cache.get(resumeId);
      const updatedData = {
        ...currentResume,
        [section]: data,
        updatedAt: new Date().toISOString()
      };

      // Update via API
      const response = await apiService.resume.saveResumeSection(resumeId, section, data);

      if (response) {
        const updatedResume = response.data || response;

        // Update cache
        this.cacheResume(updatedResume);

        // Invalidate user resumes cache
        this.invalidateUserCache();

        return updatedResume;
      }

      throw new Error('Failed to save section');
    } catch (error) {
      console.error('❌ Error saving resume section:', error);
      throw error;
    }
  }

  // ==================== ADVANCED OPERATIONS ====================

  /**
   * Duplicate a resume
   * @param {string} resumeId - Resume ID to duplicate
   * @param {string} newTitle - Title for duplicated resume
   * @returns {Promise<Object>} Duplicated resume
   */
  async duplicateResume(resumeId, newTitle = null) {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required');
      }

      console.log('📋 Duplicating resume:', resumeId);

      // Get the resume to duplicate
      const originalResume = await this.getResume(resumeId);

      if (!originalResume) {
        throw new Error('Resume not found');
      }

      // Prepare duplicate data
      const duplicateData = {
        ...originalResume,
        _id: undefined,
        id: undefined,
        title: newTitle || `${originalResume.title} (Copy)`,
        isPrimary: false,
        isStarred: false,
        isPinned: false,
        views: 0,
        downloads: 0,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create the duplicate
      const duplicatedResume = await this.createResume(duplicateData);

      toast.success('Resume duplicated successfully!');

      // Track duplication
      this.trackEvent('resume_duplicated', {
        originalResumeId: resumeId,
        newResumeId: duplicatedResume._id || duplicatedResume.id
      });

      return duplicatedResume;
    } catch (error) {
      console.error('❌ Error duplicating resume:', error);
      toast.error(error.message || 'Failed to duplicate resume');
      throw error;
    }
  }

  /**
   * Export resume to various formats
   * @param {string} resumeId - Resume ID
   * @param {string} format - Export format (pdf, docx, txt, json)
   * @param {Object} options - Export options
   * @returns {Promise<Blob|Object>} Exported file or data
   */
  async exportResume(resumeId, format = 'pdf', options = {}) {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required');
      }

      console.log('📤 Exporting resume:', { resumeId, format, options });

      const exportOptions = {
        format,
        download: options.download !== false,
        includeAnalysis: options.includeAnalysis || false,
        watermark: options.watermark || false,
        ...options
      };

      let exportData;

      if (format === 'json') {
        // For JSON, just return the resume data
        const resume = await this.getResume(resumeId);
        exportData = JSON.stringify(resume, null, 2);

        if (exportOptions.download) {
          this.downloadFile(exportData, `resume-${resumeId}.json`, 'application/json');
        }
      } else {
        // For other formats, use API
        const response = await apiService.resume.exportResume(resumeId, format);

        if (response) {
          exportData = response.data || response;

          if (exportOptions.download && exportData.blobUrl) {
            // Create download link
            const link = document.createElement('a');
            link.href = exportData.blobUrl;
            link.download = `resume-${resumeId}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      }

      // Track export
      this.trackEvent('resume_exported', {
        resumeId,
        format,
        success: !!exportData
      });

      // Update download count
      await this.incrementDownloadCount(resumeId);

      toast.success(`Resume exported as ${format.toUpperCase()} successfully!`);

      return exportData;
    } catch (error) {
      console.error('❌ Error exporting resume:', error);
      toast.error(`Failed to export resume as ${format.toUpperCase()}`);
      throw error;
    }
  }

  /**
   * Analyze resume for ATS compatibility
   * @param {string} resumeId - Resume ID
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeResume(resumeId, options = {}) {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required');
      }

      console.log('🔍 Analyzing resume:', resumeId);

      // Get resume data
      const resume = await this.getResume(resumeId);

      if (!resume) {
        throw new Error('Resume not found');
      }

      // Prepare analysis request
      const analysisData = {
        resumeId,
        resumeData: resume,
        options: {
          checkKeywords: options.checkKeywords !== false,
          checkFormatting: options.checkFormatting !== false,
          checkLength: options.checkLength !== false,
          targetJob: options.targetJob || null,
          ...options
        }
      };

      // Call analysis API
      const response = await apiService.post('/resumes/analyze', analysisData);

      if (response) {
        const analysis = response.data || response;

        // Update resume with analysis results
        const updatedResume = {
          ...resume,
          analysis: {
            ...analysis,
            lastAnalyzed: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };

        // Save analysis results
        await this.updateResume(resumeId, {
          analysis: updatedResume.analysis
        }, true);

        // Track analysis
        this.trackEvent('resume_analyzed', {
          resumeId,
          score: analysis.atsScore,
          suggestions: analysis.suggestions?.length || 0
        });

        toast.success('Resume analysis completed!');

        return analysis;
      }

      throw new Error('Analysis failed');
    } catch (error) {
      console.error('❌ Error analyzing resume:', error);
      toast.error('Failed to analyze resume');
      throw error;
    }
  }

  /**
   * Generate resume using AI
   * @param {Object} promptData - AI generation prompt
   * @param {string} templateId - Template ID (optional)
   * @returns {Promise<Object>} Generated resume
   */
  async generateResumeWithAI(promptData, templateId = null) {
    try {
      console.log('🤖 Generating resume with AI...', { promptData, templateId });

      // Check AI credits
      const user = apiService.auth.getCurrentUser();
      if (user.aiCredits <= 0) {
        throw new Error('Insufficient AI credits. Please upgrade your plan.');
      }

      // Prepare AI generation request
      const aiRequest = {
        userId: user.id,
        prompt: promptData.prompt,
        jobTitle: promptData.jobTitle,
        experienceLevel: promptData.experienceLevel,
        industry: promptData.industry,
        tone: promptData.tone || 'professional',
        length: promptData.length || 'standard',
        includeSections: promptData.includeSections || ['experience', 'education', 'skills'],
        templateId,
        ...promptData
      };

      // Call AI generation API
      const response = await apiService.post('/ai/generate-resume', aiRequest);

      if (response) {
        const generatedResume = response.data || response;

        // Deduct AI credits
        user.aiCredits--;
        localStorage.setItem('user_data', JSON.stringify(user));

        // Create resume from AI generation
        const createdResume = await this.createResume(generatedResume);

        // Track AI usage
        this.trackEvent('ai_resume_generated', {
          resumeId: createdResume._id || createdResume.id,
          jobTitle: promptData.jobTitle,
          creditsUsed: 1
        });

        toast.success('AI resume generated successfully!');

        return createdResume;
      }

      throw new Error('AI generation failed');
    } catch (error) {
      console.error('❌ Error generating resume with AI:', error);
      toast.error(error.message || 'Failed to generate resume with AI');
      throw error;
    }
  }

  /**
   * Share resume via link or email
   * @param {string} resumeId - Resume ID
   * @param {Object} shareOptions - Sharing options
   * @returns {Promise<Object>} Share result
   */
  async shareResume(resumeId, shareOptions = {}) {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required');
      }

      console.log('📤 Sharing resume:', { resumeId, shareOptions });

      const shareData = {
        resumeId,
        method: shareOptions.method || 'link',
        recipients: shareOptions.recipients || [],
        message: shareOptions.message || '',
        expiration: shareOptions.expiration || null,
        password: shareOptions.password || null,
        permissions: shareOptions.permissions || ['view'],
        ...shareOptions
      };

      // Call share API
      const response = await apiService.post('/resumes/share', shareData);

      if (response) {
        const shareResult = response.data || response;

        // Update resume share count
        await this.incrementShareCount(resumeId);

        // Track sharing
        this.trackEvent('resume_shared', {
          resumeId,
          method: shareData.method,
          recipientCount: shareData.recipients?.length || 0
        });

        toast.success('Resume shared successfully!');

        return shareResult;
      }

      throw new Error('Sharing failed');
    } catch (error) {
      console.error('❌ Error sharing resume:', error);
      toast.error('Failed to share resume');
      throw error;
    }
  }

  /**
   * Set resume as primary/default
   * @param {string} resumeId - Resume ID
   * @returns {Promise<boolean>} Success status
   */
  async setPrimaryResume(resumeId) {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required');
      }

      console.log('⭐ Setting primary resume:', resumeId);

      // Get current user
      const user = apiService.auth.getCurrentUser();

      // Update all resumes to set isPrimary = false
      const userResumes = await this.getUserResumes();
      const updatePromises = userResumes
        .filter(resume => resume.isPrimary)
        .map(resume =>
          this.updateResume(resume._id || resume.id, { isPrimary: false }, true)
        );

      await Promise.all(updatePromises);

      // Set the selected resume as primary
      await this.updateResume(resumeId, { isPrimary: true }, true);

      // Update user preferences
      await apiService.auth.updateProfile({
        preferences: {
          ...user.preferences,
          defaultResumeId: resumeId
        }
      });

      toast.success('Primary resume set successfully!');

      return true;
    } catch (error) {
      console.error('❌ Error setting primary resume:', error);
      toast.error('Failed to set primary resume');
      throw error;
    }
  }

  // ==================== TEMPLATE MANAGEMENT ====================

  /**
   * Get available resume templates
   * @param {Object} filters - Template filters
   * @returns {Promise<Array>} List of templates
   */
  async getTemplates(filters = {}) {
    try {
      const cacheKey = `templates_${JSON.stringify(filters)}`;

      // Check cache
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      console.log('📋 Fetching templates with filters:', filters);

      // Fetch templates
      const response = await apiService.get('/templates', { params: filters });

      if (response) {
        const templates = Array.isArray(response) ? response : response.data || [];

        // Cache templates
        this.cache.set(cacheKey, templates);

        return templates;
      }

      return this.getDefaultTemplates();
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      return this.getDefaultTemplates();
    }
  }

  /**
   * Get default templates (fallback)
   * @returns {Array} Default templates
   */
  getDefaultTemplates() {
    return [
      {
        id: 'modern',
        name: 'Modern',
        category: 'professional',
        thumbnail: '/templates/modern.png',
        description: 'Clean, contemporary design with bold headers',
        isFree: true,
        fields: ['personalInfo', 'experience', 'education', 'skills', 'projects']
      },
      {
        id: 'classic',
        name: 'Classic',
        category: 'professional',
        thumbnail: '/templates/classic.png',
        description: 'Traditional two-column layout',
        isFree: true,
        fields: ['personalInfo', 'summary', 'experience', 'education', 'skills']
      },
      {
        id: 'creative',
        name: 'Creative',
        category: 'design',
        thumbnail: '/templates/creative.png',
        description: 'Colorful design for creative industries',
        isFree: false,
        fields: ['personalInfo', 'portfolio', 'experience', 'education', 'skills', 'awards']
      },
      {
        id: 'minimal',
        name: 'Minimal',
        category: 'simple',
        thumbnail: '/templates/minimal.png',
        description: 'Simple and clean single-column layout',
        isFree: true,
        fields: ['personalInfo', 'experience', 'education', 'skills']
      }
    ];
  }

  /**
   * Create resume from template
   * @param {string} templateId - Template ID
   * @param {Object} userData - User data to populate
   * @returns {Promise<Object>} Created resume
   */
  async createFromTemplate(templateId, userData = {}) {
    try {
      console.log('📄 Creating resume from template:', templateId);

      // Get template
      const templates = await this.getTemplates();
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        throw new Error('Template not found');
      }

      // Get user info
      const user = apiService.auth.getCurrentUser();

      // Create base resume structure
      const baseResume = this.getEmptyResume();

      // Apply template settings
      const resumeData = {
        ...baseResume,
        title: `${template.name} Resume`,
        template: templateId,
        settings: {
          ...baseResume.settings,
          template: templateId,
          color: template.defaultColor || '#3b82f6',
          font: template.defaultFont || 'inter'
        },
        personalInfo: {
          ...baseResume.personalInfo,
          fullName: userData.fullName || user.name || '',
          email: userData.email || user.email || '',
          phone: userData.phone || user.phone || ''
        }
      };

      // Create resume
      return await this.createResume(resumeData, true);
    } catch (error) {
      console.error('❌ Error creating from template:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get empty resume structure
   * @returns {Object} Empty resume template
   */
  getEmptyResume() {
    const user = apiService.auth.getCurrentUser();

    return {
      title: 'Untitled Resume',
      template: 'modern',
      status: 'draft',
      isPrimary: false,
      isStarred: false,
      isPinned: false,
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        summary: '',
        photo: ''
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      references: [],
      awards: [],
      publications: [],
      volunteerWork: [],
      customSections: [],
      analysis: {
        atsScore: 0,
        completeness: 0,
        suggestions: [],
        lastAnalyzed: null
      },
      settings: {
        template: 'modern',
        color: '#3b82f6',
        font: 'inter',
        fontSize: 'medium',
        spacing: 'normal',
        margins: 'normal',
        showPhoto: false,
        showSummary: true,
        showSkills: true,
        showProjects: true
      },
      tags: [],
      views: 0,
      downloads: 0,
      shares: 0,
      userId: user?.id || 'unknown',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        lastOpened: null,
        autoSaveEnabled: true,
        revisionHistory: [],
        wordCount: 0,
        characterCount: 0
      }
    };
  }

  /**
   * Cache a resume
   * @param {Object} resume - Resume to cache
   */
  cacheResume(resume) {
    if (!resume) return;

    const resumeId = resume._id || resume.id;
    if (!resumeId) return;

    // Update cache
    this.cache.set(resumeId, resume);

    // Manage cache size
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    // Also cache by user
    if (resume.userId) {
      const userCacheKey = `user_${resume.userId}_resume_${resumeId}`;
      this.cache.set(userCacheKey, resume);
    }
  }

  /**
   * Invalidate user-specific cache
   */
  invalidateUserCache() {
    const user = apiService.auth.getCurrentUser();
    if (!user?.id) return;

    // Remove all cache entries for this user
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`user_${user.id}`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Resume cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      autoSaveQueueSize: this.autoSaveQueue.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }

  /**
   * Track analytics event
   * @param {string} event - Event name
   * @param {Object} properties - Event properties
   */
  trackEvent(event, properties = {}) {
    try {
      // Implement analytics tracking here
      // This could be Google Analytics, Mixpanel, etc.
      console.log('📊 Analytics Event:', event, properties);

      // Example: Send to backend analytics endpoint
      if (window.gtag) {
        window.gtag('event', event, properties);
      }
    } catch (error) {
      console.warn('⚠️ Analytics tracking failed:', error);
    }
  }

  /**
   * Download file helper
   * @param {string} content - File content
   * @param {string} filename - File name
   * @param {string} type - MIME type
   */
  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Increment view count
   * @param {string} resumeId - Resume ID
   */
  async incrementViewCount(resumeId) {
    try {
      const resume = await this.getResume(resumeId);
      if (resume) {
        const newViews = (resume.views || 0) + 1;
        await this.patchResume(resumeId, { views: newViews });
      }
    } catch (error) {
      console.warn('⚠️ Failed to increment view count:', error);
    }
  }

  /**
   * Increment download count
   * @param {string} resumeId - Resume ID
   */
  async incrementDownloadCount(resumeId) {
    try {
      const resume = await this.getResume(resumeId);
      if (resume) {
        const newDownloads = (resume.downloads || 0) + 1;
        await this.patchResume(resumeId, { downloads: newDownloads });
      }
    } catch (error) {
      console.warn('⚠️ Failed to increment download count:', error);
    }
  }

  /**
   * Increment share count
   * @param {string} resumeId - Resume ID
   */
  async incrementShareCount(resumeId) {
    try {
      const resume = await this.getResume(resumeId);
      if (resume) {
        const newShares = (resume.shares || 0) + 1;
        await this.patchResume(resumeId, { shares: newShares });
      }
    } catch (error) {
      console.warn('⚠️ Failed to increment share count:', error);
    }
  }

  /**
   * Search resumes
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchResumes(query, options = {}) {
    try {
      if (!query || query.trim() === '') {
        return await this.getUserResumes(options);
      }

      console.log('🔍 Searching resumes:', query);

      const searchOptions = {
        search: query,
        limit: options.limit || 20,
        skip: options.skip || 0,
        ...options
      };

      // Call search API
      const response = await apiService.get('/resumes/search', {
        params: searchOptions
      });

      if (response) {
        const results = Array.isArray(response) ? response : response.data || [];

        // Cache results
        results.forEach(resume => this.cacheResume(resume));

        return results;
      }

      // Fallback: client-side search
      const allResumes = await this.getUserResumes();
      const queryLower = query.toLowerCase();

      return allResumes.filter(resume => {
        const searchableText = [
          resume.title,
          resume.personalInfo?.fullName,
          resume.personalInfo?.summary,
          resume.tags?.join(' '),
          resume.experience?.map(exp => `${exp.position} ${exp.company} ${exp.description}`).join(' '),
          resume.education?.map(edu => `${edu.degree} ${edu.school}`).join(' ')
        ].filter(Boolean).join(' ').toLowerCase();

        return searchableText.includes(queryLower);
      });
    } catch (error) {
      console.error('❌ Error searching resumes:', error);
      return [];
    }
  }

  /**
   * Bulk operations
   * @param {Array} resumeIds - Array of resume IDs
   * @param {string} operation - Operation to perform
   * @param {Object} data - Operation data
   * @returns {Promise<Object>} Bulk operation result
   */
  async bulkOperation(resumeIds, operation, data = {}) {
    try {
      if (!Array.isArray(resumeIds) || resumeIds.length === 0) {
        throw new Error('No resumes selected');
      }

      console.log('🔧 Performing bulk operation:', { operation, count: resumeIds.length });

      const bulkRequest = {
        resumeIds,
        operation,
        data,
        timestamp: new Date().toISOString()
      };

      // Call bulk API
      const response = await apiService.post('/resumes/bulk', bulkRequest);

      if (response) {
        const result = response.data || response;

        // Clear cache for affected resumes
        resumeIds.forEach(id => this.cache.delete(id));
        this.invalidateUserCache();

        toast.success(`Bulk operation completed: ${resumeIds.length} resumes affected`);

        return result;
      }

      throw new Error('Bulk operation failed');
    } catch (error) {
      console.error('❌ Error in bulk operation:', error);
      toast.error('Bulk operation failed');
      throw error;
    }
  }

  /**
   * Get resume statistics
   * @param {string} timeframe - Timeframe (day, week, month, year)
   * @returns {Promise<Object>} Statistics
   */
  async getResumeStats(timeframe = 'month') {
    try {
      const cacheKey = `stats_${timeframe}`;

      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      console.log('📊 Getting resume stats for timeframe:', timeframe);

      const response = await apiService.get('/resumes/stats', {
        params: { timeframe }
      });

      if (response) {
        const stats = response.data || response;
        this.cache.set(cacheKey, stats);
        return stats;
      }

      // Fallback stats
      return {
        total: 0,
        created: 0,
        updated: 0,
        deleted: 0,
        views: 0,
        downloads: 0,
        shares: 0,
        byStatus: {},
        byTemplate: {},
        byDay: []
      };
    } catch (error) {
      console.error('❌ Error getting resume stats:', error);
      return {
        total: 0,
        created: 0,
        updated: 0,
        deleted: 0,
        views: 0,
        downloads: 0,
        shares: 0,
        byStatus: {},
        byTemplate: {},
        byDay: []
      };
    }
  }

  /**
   * Cleanup method (call on app shutdown)
   */
  cleanup() {
    // Process any remaining auto-saves
    if (this.autoSaveQueue.size > 0) {
      console.log('💾 Processing final auto-saves before cleanup');
      this.processAutoSaveQueue().catch(console.error);
    }

    // Clear timers
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    // Clear cache after delay
    setTimeout(() => {
      this.clearCache();
      console.log('🧹 Resume service cleanup completed');
    }, 5000);
  }
}

// Create singleton instance
const resumeServiceInstance = new ResumeService();

// Export the instance
export default resumeServiceInstance;

// Also export the class for testing/extending
export { ResumeService };