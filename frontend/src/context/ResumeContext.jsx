// src/context/ResumeContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ResumeContext = createContext();

export const useResume = () => useContext(ResumeContext);

export const ResumeProvider = ({ children }) => {
  // Main resume data structure
  const [currentResume, setCurrentResume] = useState({
    id: 'resume-1',
    title: 'My Professional Resume',
    template: 'modern',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      aiEnhancements: 0,
      atsScore: 85,
      completeness: 0,
      lastAnalyzed: null,
      version: 1
    },
    data: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        title: '',
        website: '',
        linkedin: '',
        github: '',
        photo: null,
        summary: ''
      },
      summary: {
        content: '',
        aiEnhanced: false,
        tone: 'professional',
        keywords: []
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      references: []
    }
  });

  // UI states
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [resumeStats, setResumeStats] = useState({
    wordCount: 0,
    characterCount: 0,
    sectionCount: 0,
    completeness: 0
  });

  // Calculate resume statistics
  const calculateStatistics = useCallback((resumeData) => {
    let wordCount = 0;
    let characterCount = 0;
    let completedSections = 0;
    const totalRequiredSections = 5; // personalInfo, summary, experience, education, skills

    // Calculate word and character counts
    Object.values(resumeData.data).forEach(section => {
      if (typeof section === 'object' && section !== null) {
        if (Array.isArray(section)) {
          section.forEach(item => {
            const text = JSON.stringify(item);
            characterCount += text.length;
            wordCount += text.split(/\s+/).filter(w => w.length > 0).length;
          });
        } else {
          const text = JSON.stringify(section);
          characterCount += text.length;
          wordCount += text.split(/\s+/).filter(w => w.length > 0).length;
        }
      }
    });

    // Calculate section completeness
    const requiredSections = ['personalInfo', 'summary', 'experience', 'education', 'skills'];
    completedSections = requiredSections.filter(sectionId => {
      const section = resumeData.data[sectionId];
      return isSectionComplete(sectionId, section);
    }).length;

    const completeness = Math.round((completedSections / totalRequiredSections) * 100);

    // Calculate ATS score (simplified version)
    const atsScore = calculateATSScore(resumeData.data);

    return {
      wordCount,
      characterCount,
      sectionCount: completedSections,
      completeness,
      atsScore
    };
  }, []);

  // Check if a section is complete
  const isSectionComplete = useCallback((sectionId, sectionData = currentResume.data[sectionId]) => {
    const requiredFields = {
      personalInfo: ['firstName', 'lastName', 'email', 'phone', 'title'],
      summary: ['content'],
      experience: (data) => Array.isArray(data) && data.length > 0 &&
        data.every(exp => exp.company && exp.position && exp.startDate),
      education: (data) => Array.isArray(data) && data.length > 0 &&
        data.every(edu => edu.school && edu.degree && edu.startDate),
      skills: (data) => Array.isArray(data) && data.length > 0,
      projects: (data) => Array.isArray(data) && data.length > 0,
      certifications: () => true, // Optional
      languages: () => true, // Optional
      references: () => true  // Optional
    };

    const validator = requiredFields[sectionId];

    if (typeof validator === 'function') {
      return validator(sectionData);
    } else if (Array.isArray(validator)) {
      return validator.every(field => sectionData[field] && sectionData[field].trim().length > 0);
    }

    return false;
  }, [currentResume]);

  // Calculate ATS score
  const calculateATSScore = useCallback((data) => {
    let score = 60; // Base score

    // Keywords analysis
    const keywords = [
      // Technical skills
      'javascript', 'react', 'node', 'python', 'java', 'sql', 'aws', 'docker', 'kubernetes',
      // Action verbs
      'developed', 'implemented', 'managed', 'led', 'created', 'improved', 'optimized',
      // Soft skills
      'communication', 'leadership', 'teamwork', 'problem-solving', 'adaptability',
      // Quantifiers
      'increased', 'decreased', 'reduced', 'improved', 'achieved'
    ];

    const content = JSON.stringify(data).toLowerCase();
    const foundKeywords = keywords.filter(keyword => content.includes(keyword));

    // Add points for found keywords (max 20 points)
    score += Math.min(foundKeywords.length * 2, 20);

    // Check for metrics (numbers, percentages, etc.)
    const hasMetrics = /\d+%|\$\d+|\d+\+|\d+x/.test(content);
    if (hasMetrics) score += 10;

    // Check for proper formatting
    const hasBulletPoints = content.includes('•') || content.includes('-');
    if (hasBulletPoints) score += 5;

    // Check for action verbs at beginning
    const actionVerbs = /(developed|created|implemented|managed|led|improved)\s/.test(content);
    if (actionVerbs) score += 5;

    return Math.min(score, 100);
  }, []);

  // Update section data
  const updateSection = useCallback((sectionId, data) => {
    setCurrentResume(prev => {
      const updated = {
        ...prev,
        updatedAt: new Date().toISOString(),
        metadata: {
          ...prev.metadata,
          version: prev.metadata.version + 1
        },
        data: {
          ...prev.data,
          [sectionId]: Array.isArray(prev.data[sectionId]) && Array.isArray(data)
            ? data
            : { ...prev.data[sectionId], ...data }
        }
      };

      // Update statistics
      setResumeStats(calculateStatistics(updated));

      return updated;
    });

    // Trigger auto-save if enabled
    if (autoSaveEnabled) {
      debouncedSave();
    }
  }, [autoSaveEnabled, calculateStatistics]);

  // Enhanced AI content generation
  const enhanceWithAI = useCallback(async (sectionId, instruction, options = {}) => {
    setIsLoading(true);

    try {
      const sectionData = currentResume.data[sectionId];
      const enhancedContent = await generateAIContent(sectionId, sectionData, instruction, options);

      updateSection(sectionId, enhancedContent);

      // Update AI enhancements count
      setCurrentResume(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          aiEnhancements: (prev.metadata.aiEnhancements || 0) + 1,
          lastAnalyzed: new Date().toISOString()
        }
      }));

      toast.success('AI enhancement applied successfully!');
      return enhancedContent;
    } catch (error) {
      toast.error('Failed to apply AI enhancement');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentResume, updateSection]);

  // Simulate AI content generation
  const generateAIContent = useCallback(async (sectionId, data, instruction, options) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const generators = {
      summary: () => ({
        content: `Results-driven ${data.title || 'professional'} with extensive experience in delivering innovative solutions. Proven track record of leading cross-functional teams and driving business growth through strategic planning and execution. Strong analytical skills combined with excellent communication abilities.`,
        aiEnhanced: true,
        keywords: ['leadership', 'strategy', 'innovation', 'analytical', 'communication']
      }),
      experience: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          return data.map(exp => ({
            ...exp,
            description: exp.description || `• Led initiatives that increased efficiency by 30%\n• Managed budgets up to $500,000\n• Mentored 5+ team members\n• Implemented new processes that reduced costs by 25%`,
            achievements: exp.achievements || ['Increased team productivity by 40%', 'Reduced operational costs by 25%', 'Improved customer satisfaction scores by 35%']
          }));
        }
        return data;
      },
      skills: (data) => {
        const enhancedSkills = [
          'JavaScript (ES6+)',
          'React & React Hooks',
          'Node.js & Express',
          'TypeScript',
          'Python',
          'AWS Cloud Services',
          'Docker & Kubernetes',
          'MongoDB & PostgreSQL',
          'Git & CI/CD',
          'Agile/Scrum Methodology'
        ];
        return Array.isArray(data) ? [...data, ...enhancedSkills.filter(s => !data.includes(s))] : enhancedSkills;
      }
    };

    const generator = generators[sectionId];
    return generator ? generator(data) : data;
  }, []);

  // Export resume in various formats
  const exportResume = useCallback(async (format = 'pdf', options = {}) => {
    setIsLoading(true);

    try {
      let result;

      switch (format) {
        case 'pdf':
          result = await generatePDF(currentResume, options);
          break;
        case 'docx':
          result = await generateDOCX(currentResume, options);
          break;
        case 'json':
          result = {
            data: currentResume,
            fileName: `${currentResume.title.replace(/\s+/g, '-').toLowerCase()}.json`,
            mimeType: 'application/json'
          };
          break;
        case 'txt':
          result = await generateText(currentResume, options);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      toast.success(`Resume exported as ${format.toUpperCase()}`);
      return result;
    } catch (error) {
      toast.error(`Failed to export resume: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentResume]);

  // Generate PDF (simulated)
  const generatePDF = useCallback(async (resume, options) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      blob: new Blob([JSON.stringify(resume)], { type: 'application/pdf' }),
      fileName: `${resume.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      mimeType: 'application/pdf'
    };
  }, []);

  // Save resume to backend
  const saveResume = useCallback(async () => {
    if (saveStatus === 'saving') return;

    setSaveStatus('saving');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you would send to your backend:
      // await api.saveResume(currentResume);

      setSaveStatus('saved');
      setLastSaveTime(new Date());

      // Update statistics
      setResumeStats(calculateStatistics(currentResume));

      return { success: true, message: 'Resume saved successfully' };
    } catch (error) {
      setSaveStatus('error');
      toast.error('Failed to save resume');
      throw error;
    }
  }, [currentResume, saveStatus, calculateStatistics]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    const timeout = setTimeout(() => {
      if (autoSaveEnabled) {
        saveResume();
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [autoSaveEnabled, saveResume]);

  // Load resume from storage
  const loadResume = useCallback(async (resumeId) => {
    setIsLoading(true);

    try {
      // Simulate loading from localStorage/backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      const savedResume = localStorage.getItem(`resume_${resumeId}`);

      if (savedResume) {
        const parsed = JSON.parse(savedResume);
        setCurrentResume(parsed);
        setResumeStats(calculateStatistics(parsed));
        toast.success('Resume loaded successfully');
      } else {
        toast.info('No saved resume found, starting fresh');
      }
    } catch (error) {
      toast.error('Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  }, [calculateStatistics]);

  // Reset resume to default
  const resetResume = useCallback(() => {
    setCurrentResume({
      id: 'resume-' + Date.now(),
      title: 'My Professional Resume',
      template: 'modern',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        aiEnhancements: 0,
        atsScore: 85,
        completeness: 0,
        lastAnalyzed: null,
        version: 1
      },
      data: {
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          location: '',
          title: '',
          website: '',
          linkedin: '',
          github: '',
          photo: null,
          summary: ''
        },
        summary: { content: '', aiEnhanced: false, tone: 'professional', keywords: [] },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        references: []
      }
    });

    toast.success('Resume reset to default');
  }, []);

  // Calculate completeness percentage
  const calculateCompleteness = useCallback(() => {
    const sections = ['personalInfo', 'summary', 'experience', 'education', 'skills'];
    const completed = sections.filter(section => isSectionComplete(section));
    return Math.round((completed.length / sections.length) * 100);
  }, [isSectionComplete]);

  // Auto-save resume on changes
  useEffect(() => {
    if (autoSaveEnabled) {
      const timeout = setTimeout(() => {
        saveResume();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timeout);
    }
  }, [currentResume, autoSaveEnabled, saveResume]);

  // Initialize statistics
  useEffect(() => {
    setResumeStats(calculateStatistics(currentResume));
  }, [currentResume, calculateStatistics]);

  const value = {
    // Data
    currentResume,
    saveStatus,
    isLoading,
    autoSaveEnabled,
    lastSaveTime,
    resumeStats,

    // Actions
    updateSection,
    saveResume,
    loadResume,
    resetResume,
    exportResume,
    enhanceWithAI,

    // Utilities
    isSectionComplete,
    calculateCompleteness,
    setAutoSaveEnabled,

    // Enhanced
    calculateStatistics,
    generateAIContent
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};