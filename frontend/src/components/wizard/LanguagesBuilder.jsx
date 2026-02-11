// src/components/wizard/LanguageBuilder.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Globe,
  MessageSquare,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Target,
  Star,
  Edit2,
  Trash2,
  Plus,
  Volume2,
  BookOpen,
  Users,
  Briefcase,
  Sparkles
} from 'lucide-react';

// CORRECTED IMPORT - Use specific functions from aiService.js
import {
  aiEnhance,
  generateSummary,
  suggestKeywords,
  analyzeATS
} from '../../services/aiService';

const LanguageBuilder = ({
  data = [],
  onChange,
  onAIEnhance,
  isAnalyzing,
  targetRole = '',
  jobDescription = '',
  location = ''
}) => {
  const [languages, setLanguages] = useState(Array.isArray(data) ? data : []);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [languageStats, setLanguageStats] = useState({
    total: 0,
    advanced: 0,
    professional: 0,
    marketValue: 0
  });
  const [editingId, setEditingId] = useState(null);

  // Language proficiency levels
  const proficiencyLevels = [
    { value: 'native', label: 'Native', color: 'from-green-600 to-emerald-600', score: 100 },
    { value: 'fluent', label: 'Fluent', color: 'from-blue-600 to-cyan-600', score: 85 },
    { value: 'advanced', label: 'Advanced', color: 'from-purple-600 to-pink-600', score: 70 },
    { value: 'intermediate', label: 'Intermediate', color: 'from-amber-500 to-orange-500', score: 55 },
    { value: 'basic', label: 'Basic', color: 'from-gray-500 to-gray-600', score: 40 },
    { value: 'beginner', label: 'Beginner', color: 'from-red-500 to-rose-500', score: 25 }
  ];

  // Common languages with market demand
  const commonLanguages = [
    { name: 'English', demand: 'very-high', marketValue: 95 },
    { name: 'Spanish', demand: 'high', marketValue: 85 },
    { name: 'Mandarin', demand: 'high', marketValue: 90 },
    { name: 'German', demand: 'medium', marketValue: 80 },
    { name: 'French', demand: 'medium', marketValue: 78 },
    { name: 'Japanese', demand: 'medium', marketValue: 82 },
    { name: 'Arabic', demand: 'medium', marketValue: 75 },
    { name: 'Portuguese', demand: 'medium', marketValue: 72 },
    { name: 'Russian', demand: 'low', marketValue: 68 },
    { name: 'Korean', demand: 'medium', marketValue: 76 },
    { name: 'Italian', demand: 'medium', marketValue: 75 },
    { name: 'Dutch', demand: 'medium', marketValue: 70 },
    { name: 'Hindi', demand: 'medium', marketValue: 78 },
    { name: 'Bengali', demand: 'low', marketValue: 65 },
    { name: 'Turkish', demand: 'medium', marketValue: 72 }
  ];

  // Language certifications database
  const languageCertifications = {
    'English': ['TOEFL', 'IELTS', 'TOEIC', 'Cambridge C1/C2', 'PTE Academic'],
    'Spanish': ['DELE', 'SIELE'],
    'French': ['DELF', 'DALF', 'TCF'],
    'German': ['Goethe-Zertifikat', 'TestDaF', 'DSH'],
    'Japanese': ['JLPT N1-N5'],
    'Chinese': ['HSK 1-6', 'TOCFL'],
    'Korean': ['TOPIK I-II'],
    'Arabic': ['ALPT', 'Arabic Standardized Test'],
    'Italian': ['CILS', 'CELI'],
    'Portuguese': ['CELPE-Bras']
  };

  // Calculate language statistics
  useEffect(() => {
    if (languages.length > 0) {
      const total = languages.length;
      const advanced = languages.filter(lang =>
        ['native', 'fluent', 'advanced'].includes(lang.proficiency)
      ).length;
      const professional = languages.filter(lang => lang.isProfessional).length;
      const marketValue = languages.reduce((sum, lang) => {
        const langData = commonLanguages.find(l => l.name === lang.name);
        const proficiency = proficiencyLevels.find(p => p.value === lang.proficiency);
        const langScore = (langData?.marketValue || 50) * (proficiency?.score || 50) / 100;
        return sum + langScore;
      }, 0) / total;

      setLanguageStats({
        total,
        advanced,
        professional,
        marketValue: Math.round(marketValue)
      });
    } else {
      setLanguageStats({
        total: 0,
        advanced: 0,
        professional: 0,
        marketValue: 0
      });
    }
  }, [languages]);

  const handleAddLanguage = () => {
    const newLanguage = {
      id: Date.now().toString(),
      name: '',
      proficiency: 'intermediate',
      isProfessional: true,
      certification: '',
      yearsExperience: 0,
      lastUsed: new Date().getFullYear(),
      speaking: 50,
      writing: 50,
      reading: 50,
      listening: 50,
      marketDemand: 'medium',
      marketValue: 50,
      isRequired: false,
      notes: '',
      regionalDialect: '',
      businessProficiency: false,
      technicalVocabulary: false
    };

    const updated = [...languages, newLanguage];
    setLanguages(updated);
    onChange(updated);
    setEditingId(newLanguage.id);
  };

  const handleRemoveLanguage = (id) => {
    const updated = languages.filter(lang => lang.id !== id);
    setLanguages(updated);
    onChange(updated);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleUpdateLanguage = (id, field, value) => {
    const updated = languages.map(lang =>
      lang.id === id ? {
        ...lang,
        [field]: value,
        ...(field === 'name' ? {
          marketDemand: commonLanguages.find(l => l.name === value)?.demand || 'low',
          marketValue: commonLanguages.find(l => l.name === value)?.marketValue || 50
        } : {}),
        ...(field === 'proficiency' ? {
          // Update skill scores based on proficiency
          speaking: getDefaultSkillScore(value, 'speaking'),
          writing: getDefaultSkillScore(value, 'writing'),
          reading: getDefaultSkillScore(value, 'reading'),
          listening: getDefaultSkillScore(value, 'listening')
        } : {})
      } : lang
    );
    setLanguages(updated);
    onChange(updated);
  };

  const getDefaultSkillScore = (proficiency, skill) => {
    const proficiencyData = proficiencyLevels.find(p => p.value === proficiency);
    const baseScore = proficiencyData?.score || 50;

    // Adjust based on skill type
    switch (skill) {
    case 'speaking': return Math.min(100, baseScore - 5);
    case 'writing': return Math.min(100, baseScore - 10);
    case 'reading': return Math.min(100, baseScore + 5);
    case 'listening': return Math.min(100, baseScore);
    default: return baseScore;
    }
  };

  // AI Enhancement Functions
  const handleAIEnhanceLanguage = async (id) => {
    const language = languages.find(l => l.id === id);
    if (!language || !language.name) {
      toast.error('Please select a language first');
      return;
    }

    setIsLoadingAI(true);
    try {
      toast.loading('AI is analyzing language proficiency...');

      // Create mock resume data for AI enhancement
      const mockResumeData = {
        languages: [language],
        targetRole: targetRole,
        personalInfo: { location: location }
      };

      const enhancedData = await aiEnhance(mockResumeData, 'language', jobDescription);

      if (enhancedData?.languages?.[0]) {
        const enhanced = enhancedData.languages[0];
        const updated = languages.map(l =>
          l.id === id ? {
            ...l,
            proficiency: enhanced.proficiency || l.proficiency,
            isProfessional: enhanced.isProfessional !== undefined ? enhanced.isProfessional : l.isProfessional,
            marketDemand: enhanced.marketDemand || l.marketDemand,
            marketValue: enhanced.marketValue || l.marketValue,
            isRequired: enhanced.isRequired !== undefined ? enhanced.isRequired : l.isRequired,
            notes: enhanced.notes || l.notes
          } : l
        );

        setLanguages(updated);
        onChange(updated);

        toast.dismiss();
        toast.success('Language enhanced with AI!');
      } else {
        toast.dismiss();
        toast.info('No AI enhancements were made');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('AI enhancement failed');
      console.error('AI enhancement error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAIAssessProficiency = async (id) => {
    const language = languages.find(l => l.id === id);
    if (!language || !language.name) {
      toast.error('Please select a language first');
      return;
    }

    setIsLoadingAI(true);
    try {
      toast.loading('AI is assessing language proficiency...');

      // Simulate AI assessment based on language name and other factors
      const assessment = simulateAIAssessment(language);

      const updated = languages.map(l =>
        l.id === id ? {
          ...l,
          speaking: assessment.speaking,
          writing: assessment.writing,
          reading: assessment.reading,
          listening: assessment.listening,
          proficiency: getProficiencyFromScores(assessment)
        } : l
      );

      setLanguages(updated);
      onChange(updated);

      toast.dismiss();
      toast.success('Proficiency assessment complete!');
    } catch (error) {
      toast.dismiss();
      toast.error('Assessment failed');
      console.error('AI assessment error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const simulateAIAssessment = (language) => {
    // Simulate AI assessment logic
    const baseScore = language.proficiency ?
      proficiencyLevels.find(p => p.value === language.proficiency)?.score || 50 : 50;

    const yearsFactor = Math.min(100, baseScore + (language.yearsExperience || 0) * 5);
    const professionalFactor = language.isProfessional ? 10 : 0;

    // Add some variation between skills
    const variation = () => Math.floor(Math.random() * 20) - 10;

    return {
      speaking: Math.min(100, Math.max(20, yearsFactor + professionalFactor + variation())),
      writing: Math.min(100, Math.max(20, yearsFactor + professionalFactor - 5 + variation())),
      reading: Math.min(100, Math.max(20, yearsFactor + professionalFactor + 5 + variation())),
      listening: Math.min(100, Math.max(20, yearsFactor + professionalFactor + variation()))
    };
  };

  const handleAIGenerateCertification = async (id) => {
    const language = languages.find(l => l.id === id);
    if (!language || !language.name) {
      toast.error('Please select a language first');
      return;
    }

    setIsLoadingAI(true);
    try {
      toast.loading('AI is suggesting certifications...');

      // Get certifications for the language
      const certs = languageCertifications[language.name] || [];
      let certification = '';

      if (certs.length > 0) {
        // Select appropriate certification based on proficiency
        if (['native', 'fluent'].includes(language.proficiency)) {
          certification = certs[0]; // Highest level cert
        } else if (language.proficiency === 'advanced') {
          certification = certs.length > 1 ? certs[1] : certs[0];
        } else {
          certification = certs[certs.length - 1]; // Beginner level
        }

        // Add specific level if applicable
        if (language.name === 'Japanese' && language.proficiency === 'advanced') {
          certification = 'JLPT N2';
        } else if (language.name === 'Chinese' && language.proficiency === 'intermediate') {
          certification = 'HSK 4';
        }
      } else {
        // Generate generic certification suggestion
        certification = `${language.name} Proficiency Certificate`;
        if (language.proficiency === 'native') {
          certification = `Native ${language.name} Speaker`;
        } else if (language.proficiency === 'fluent') {
          certification = `Fluent ${language.name} Certification`;
        }
      }

      const updated = languages.map(l =>
        l.id === id ? {
          ...l,
          certification: certification
        } : l
      );

      setLanguages(updated);
      onChange(updated);

      toast.dismiss();
      toast.success('Certification suggestion added!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate certification');
      console.error('Certification generation error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAIAnalyzeMarketDemand = async () => {
    if (!targetRole && !location) {
      toast.error('Please set target role or location for market analysis');
      return;
    }

    setIsLoadingAI(true);
    try {
      toast.loading('AI is analyzing market demand...');

      // Use suggestKeywords to analyze job description for language requirements
      const keywords = await suggestKeywords(targetRole, jobDescription);

      // Look for language-related keywords
      const languageKeywords = keywords.filter(keyword =>
        commonLanguages.some(lang =>
          keyword.toLowerCase().includes(lang.name.toLowerCase()) ||
                    keyword.toLowerCase().includes('language') ||
                    keyword.toLowerCase().includes('bilingual') ||
                    keyword.toLowerCase().includes('multilingual')
        )
      );

      // Update languages based on analysis
      const updated = languages.map(lang => {
        const isMentioned = languageKeywords.some(keyword =>
          keyword.toLowerCase().includes(lang.name.toLowerCase())
        );

        // Increase market value if mentioned in job description
        let newMarketValue = lang.marketValue;
        let newDemand = lang.marketDemand;

        if (isMentioned) {
          newMarketValue = Math.min(100, lang.marketValue + 20);
          newDemand = lang.marketDemand === 'low' ? 'medium' :
            lang.marketDemand === 'medium' ? 'high' : 'very-high';
        }

        return {
          ...lang,
          marketValue: newMarketValue,
          marketDemand: newDemand,
          isRequired: isMentioned || lang.isRequired
        };
      });

      setLanguages(updated);
      onChange(updated);

      toast.dismiss();
      toast.success('Market demand analysis complete!');
    } catch (error) {
      toast.dismiss();
      toast.error('Market analysis failed');
      console.error('Market analysis error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getProficiencyFromScores = (scores) => {
    const avg = (scores.speaking + scores.writing + scores.reading + scores.listening) / 4;
    if (avg >= 90) {
      return 'native';
    }
    if (avg >= 80) {
      return 'fluent';
    }
    if (avg >= 65) {
      return 'advanced';
    }
    if (avg >= 50) {
      return 'intermediate';
    }
    if (avg >= 30) {
      return 'basic';
    }
    return 'beginner';
  };

  const getProficiencyColor = (proficiency) => {
    const level = proficiencyLevels.find(p => p.value === proficiency);
    return level?.color || 'from-gray-500 to-gray-600';
  };

  const getDemandColor = (demand) => {
    switch (demand) {
    case 'very-high': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
    case 'high': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200';
    case 'medium': return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200';
    case 'low': return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
    default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getSkillBarColor = (value) => {
    if (value >= 90) {
      return 'bg-green-500';
    }
    if (value >= 70) {
      return 'bg-blue-500';
    }
    if (value >= 50) {
      return 'bg-amber-500';
    }
    if (value >= 30) {
      return 'bg-orange-500';
    }
    return 'bg-red-500';
  };

  const renderSkillBar = (label, value) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${getSkillBarColor(value)} transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  const handleSkillChange = (id, skill, value) => {
    const updated = languages.map(lang =>
      lang.id === id ? {
        ...lang,
        [skill]: value
      } : lang
    );
    setLanguages(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Language Proficiency</h3>
          <p className="text-gray-600">Showcase your multilingual skills for global opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAIAnalyzeMarketDemand}
            disabled={isLoadingAI || (!targetRole && !location)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isLoadingAI ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
                        AI Market Analysis
          </button>
          <button
            onClick={handleAddLanguage}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
                        Add Language
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {languages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Languages</p>
                <p className="text-2xl font-bold text-blue-900">{languageStats.total}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Advanced Level</p>
                <p className="text-2xl font-bold text-green-900">{languageStats.advanced}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Professional Use</p>
                <p className="text-2xl font-bold text-purple-900">{languageStats.professional}</p>
              </div>
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Market Value</p>
                <p className="text-2xl font-bold text-amber-900">{languageStats.marketValue}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      {/* Languages List */}
      <div className="space-y-4">
        {languages.map((lang, index) => (
          <motion.div
            key={lang.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Language Header */}
            <div className={`p-6 bg-gradient-to-r ${getProficiencyColor(lang.proficiency)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-bold text-white">
                        {lang.name || `Language #${index + 1}`}
                      </h4>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                        {proficiencyLevels.find(p => p.value === lang.proficiency)?.label || 'Intermediate'}
                      </span>
                      {lang.isRequired && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                          <Target className="w-3 h-3" />
                                                    Required
                        </span>
                      )}
                      {lang.businessProficiency && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                                                    Business
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {lang.yearsExperience > 0 && (
                        <span className="text-white/90 text-sm flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {lang.yearsExperience} years experience
                        </span>
                      )}
                      {lang.certification && (
                        <span className="text-white/90 text-sm flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {lang.certification}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDemandColor(lang.marketDemand)}`}>
                        {lang.marketDemand?.toUpperCase().replace('-', ' ')} DEMAND
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAIGenerateCertification(lang.id)}
                    disabled={isLoadingAI}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title="Suggest certification"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAIAssessProficiency(lang.id)}
                    disabled={isLoadingAI}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title="AI Assess Proficiency"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAIEnhanceLanguage(lang.id)}
                    disabled={isLoadingAI}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title="AI Enhance"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(editingId === lang.id ? null : lang.id)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title={editingId === lang.id ? 'Close Edit' : 'Edit Language'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveLanguage(lang.id)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title="Remove Language"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Language Details */}
            <div className="p-6">
              {editingId === lang.id ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Language Name *
                      </label>
                      <select
                        value={lang.name || ''}
                        onChange={(e) => handleUpdateLanguage(lang.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">Select a language</option>
                        {commonLanguages.map((commonLang) => (
                          <option key={commonLang.name} value={commonLang.name}>
                            {commonLang.name} ({commonLang.marketValue}% value)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Proficiency Level *
                      </label>
                      <select
                        value={lang.proficiency || 'intermediate'}
                        onChange={(e) => handleUpdateLanguage(lang.id, 'proficiency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {proficiencyLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label} ({level.score}%)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Years of Experience
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={lang.yearsExperience || 0}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'yearsExperience', parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                          {lang.yearsExperience || 0} yrs
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Used
                      </label>
                      <select
                        value={lang.lastUsed || new Date().getFullYear()}
                        onChange={(e) => handleUpdateLanguage(lang.id, 'lastUsed', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                          <option key={year} value={year}>
                            {year === new Date().getFullYear() ? 'Current' : year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Skill Assessment */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-blue-900">Skill Assessment</h5>
                      <button
                        onClick={() => handleAIAssessProficiency(lang.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                                                AI Assess Proficiency
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Speaking</span>
                            <span className="font-medium">{lang.speaking || 50}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={lang.speaking || 50}
                            onChange={(e) => handleSkillChange(lang.id, 'speaking', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Listening</span>
                            <span className="font-medium">{lang.listening || 50}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={lang.listening || 50}
                            onChange={(e) => handleSkillChange(lang.id, 'listening', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Writing</span>
                            <span className="font-medium">{lang.writing || 50}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={lang.writing || 50}
                            onChange={(e) => handleSkillChange(lang.id, 'writing', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Reading</span>
                            <span className="font-medium">{lang.reading || 50}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={lang.reading || 50}
                            onChange={(e) => handleSkillChange(lang.id, 'reading', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Certification
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={lang.certification || ''}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'certification', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="e.g., TOEFL, DELE, JLPT N2"
                        />
                        <button
                          onClick={() => handleAIGenerateCertification(lang.id)}
                          disabled={isLoadingAI || !lang.name}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                          title="AI suggest certification"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Regional Dialect / Variant
                      </label>
                      <input
                        type="text"
                        value={lang.regionalDialect || ''}
                        onChange={(e) => handleUpdateLanguage(lang.id, 'regionalDialect', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="e.g., Latin American Spanish, Brazilian Portuguese"
                      />
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lang.isProfessional || false}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'isProfessional', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Used in professional settings</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lang.isRequired || false}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'isRequired', e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Required for target role</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lang.businessProficiency || false}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'businessProficiency', e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Business proficiency</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lang.technicalVocabulary || false}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'technicalVocabulary', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Technical vocabulary</span>
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Additional Notes
                    </label>
                    <textarea
                      value={lang.notes || ''}
                      onChange={(e) => handleUpdateLanguage(lang.id, 'notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Business proficiency, technical vocabulary, regional dialect, specific achievements..."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Proficiency Details */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                                            Proficiency Breakdown
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall</span>
                        <span className="font-medium px-2 py-1 bg-gray-100 rounded">
                          {proficiencyLevels.find(p => p.value === lang.proficiency)?.label}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {renderSkillBar('Speaking', lang.speaking || 50)}
                        {renderSkillBar('Writing', lang.writing || 50)}
                        {renderSkillBar('Reading', lang.reading || 50)}
                        {renderSkillBar('Listening', lang.listening || 50)}
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                                            Professional Details
                    </h5>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="text-gray-600 mb-1">Experience</div>
                        <div className="font-medium flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {lang.yearsExperience || 0} years
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-600 mb-1">Last Used</div>
                        <div className="font-medium">
                          {lang.lastUsed === new Date().getFullYear() ? 'Currently using' : `Last used in ${lang.lastUsed}`}
                        </div>
                      </div>
                      {lang.certification && (
                        <div className="text-sm">
                          <div className="text-gray-600 mb-1">Certification</div>
                          <div className="font-medium text-blue-600 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {lang.certification}
                          </div>
                        </div>
                      )}
                      {lang.regionalDialect && (
                        <div className="text-sm">
                          <div className="text-gray-600 mb-1">Regional Variant</div>
                          <div className="font-medium text-gray-800">
                            {lang.regionalDialect}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Market Value */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                                            Market Value
                    </h5>
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${getDemandColor(lang.marketDemand)}`}>
                        <div className="text-sm font-medium mb-1">Demand Level</div>
                        <div className="text-lg font-bold">
                          {lang.marketDemand?.toUpperCase().replace('-', ' ')}
                        </div>
                        <div className="text-sm mt-1">Market Value: {lang.marketValue}%</div>
                      </div>
                      <div className="space-y-2">
                        {lang.isProfessional && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Professional experience verified</span>
                          </div>
                        )}
                        {lang.isRequired && (
                          <div className="flex items-center gap-2 text-red-600">
                            <Target className="w-4 h-4" />
                            <span className="text-sm">Required for target role</span>
                          </div>
                        )}
                        {lang.businessProficiency && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-sm">Business proficiency</span>
                          </div>
                        )}
                        {lang.technicalVocabulary && (
                          <div className="flex items-center gap-2 text-purple-600">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm">Technical vocabulary</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {languages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-b from-gray-50 to-white"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
            <Globe className="w-10 h-10 text-blue-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">No languages added yet</h4>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Add languages to showcase your multilingual abilities and increase your global marketability.
                        Language skills can increase job opportunities by up to 300% for international roles.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleAddLanguage}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
                            Add Your First Language
            </button>
            <div className="text-sm text-gray-500 mt-2 max-w-md">
              <p>Common professional languages: English, Spanish, Mandarin, German, French</p>
              <p className="text-xs mt-1">Click "AI Market Analysis" after adding languages to see market demand</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Add Common Languages */}
      {languages.length > 0 && languages.length < 5 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h5 className="font-medium text-gray-900 mb-3">Quick Add Common Languages</h5>
          <div className="flex flex-wrap gap-2">
            {commonLanguages
              .filter(lang => !languages.some(l => l.name === lang.name))
              .slice(0, 8)
              .map((commonLang) => (
                <button
                  key={commonLang.name}
                  onClick={() => {
                    const newLang = {
                      id: Date.now().toString(),
                      name: commonLang.name,
                      proficiency: 'intermediate',
                      isProfessional: true,
                      marketDemand: commonLang.demand,
                      marketValue: commonLang.marketValue,
                      yearsExperience: 0,
                      lastUsed: new Date().getFullYear(),
                      speaking: 50,
                      writing: 50,
                      reading: 50,
                      listening: 50
                    };
                    const updated = [...languages, newLang];
                    setLanguages(updated);
                    onChange(updated);
                  }}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-sm transition-colors"
                >
                  {commonLang.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Language Tips */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-green-900 mb-2 text-lg">Language Proficiency Tips</h5>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5"></div>
                <span><strong>Order by proficiency:</strong> List languages from highest to lowest proficiency level</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5"></div>
                <span><strong>Include certifications:</strong> Add language tests (TOEFL, DELE, JLPT) to validate proficiency</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5"></div>
                <span><strong>Professional context:</strong> Specify if used in business, technical, or client-facing roles</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5"></div>
                <span><strong>Market demand:</strong> Use AI Market Analysis to see which languages are in demand for your target role</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5"></div>
                <span><strong>Regional requirements:</strong> Consider language requirements for target job locations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Language Stats & Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h5 className="font-medium text-blue-900 mb-2">Benefits of Multilingual Skills</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>30% higher</strong> salary potential for bilingual roles</li>
            <li>• <strong>2x more</strong> job opportunities in international companies</li>
            <li>• <strong>40% faster</strong> career progression in global organizations</li>
            <li>• <strong>25% increase</strong> in negotiation power for international roles</li>
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h5 className="font-medium text-amber-900 mb-2">Most Valuable Languages by Industry</h5>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• <strong>Tech:</strong> English, Mandarin, Japanese, German</li>
            <li>• <strong>Finance:</strong> English, Arabic, Mandarin, French</li>
            <li>• <strong>Healthcare:</strong> Spanish, Mandarin, Arabic, French</li>
            <li>• <strong>Tourism:</strong> Spanish, French, German, Japanese</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LanguageBuilder;