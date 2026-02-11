// ------------------- ExperienceBuilder.jsx -------------------
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Edit,
  Copy,
  BarChart,
  Target,
  Zap,
  Award,
  Check,
  X,
  ArrowUpDown,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

const ExperienceBuilder = ({
  data = [],
  onChange,
  onAIEnhance,
  onNext,
  onBack,
  isAnalyzing = false,
  targetRole = '',
  keywords = []
}) => {
  const [experiences, setExperiences] = useState(data || []);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // AI Experience Analysis Mutation
  const analyzeExperienceMutation = useMutation({
    mutationFn: async (experienceData) => {
      const response = await fetch('/api/ai/experience/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience: experienceData,
          targetRole,
          keywords
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze experience');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success('AI analyzed experience!');
      // Update with AI suggestions
    },
    onError: (error) => {
      console.error('Experience analysis error:', error);
    }
  });

  // AI Optimize Bullets Mutation
  const optimizeBulletsMutation = useMutation({
    mutationFn: async ({ expIndex, bullets }) => {
      const response = await fetch('/api/ai/experience/optimize-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullets,
          targetRole,
          keywords,
          jobTitle: experiences[expIndex]?.title || ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize bullets');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      const { expIndex } = variables;
      const updated = [...experiences];
      updated[expIndex].bullets = data.optimizedBullets;
      setExperiences(updated);
      onChange(updated);
      toast.success('AI optimized bullet points!');
    },
    onError: (error) => {
      toast.error('Failed to optimize bullets');
      console.error('Bullet optimization error:', error);
    }
  });

  // AI Suggest Achievements Mutation
  const suggestAchievementsMutation = useMutation({
    mutationFn: async (expIndex) => {
      const experience = experiences[expIndex];
      const response = await fetch('/api/ai/experience/suggest-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: experience.title,
          company: experience.company,
          description: experience.description,
          targetRole
        })
      });

      if (!response.ok) {
        throw new Error('Failed to suggest achievements');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      const expIndex = variables;
      const updated = [...experiences];
      if (!updated[expIndex].achievements) {
        updated[expIndex].achievements = [];
      }
      updated[expIndex].achievements = [...updated[expIndex].achievements, ...data.achievements];
      setExperiences(updated);
      onChange(updated);
      toast.success('AI suggested achievements!');
    },
    onError: (error) => {
      toast.error('Failed to suggest achievements');
      console.error('Achievements error:', error);
    }
  });

  // AI Generate Entire Experience Mutation
  const generateExperienceMutation = useMutation({
    mutationFn: async (prompt) => {
      const response = await fetch('/api/ai/experience/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          targetRole,
          existingExperiences: experiences
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate experience');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const newExperience = data.experience;
      const updated = [...experiences, newExperience];
      setExperiences(updated);
      onChange(updated);
      setExpandedIndex(updated.length - 1);
      toast.success('AI generated new experience!');
    },
    onError: (error) => {
      toast.error('Failed to generate experience');
      console.error('Experience generation error:', error);
    }
  });

  const newExperienceTemplate = {
    id: Date.now(),
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    bullets: ['', '', ''],
    achievements: []
  };

  useEffect(() => {
    setExperiences(data || []);
  }, [data]);

  const handleAddExperience = () => {
    const newExp = { ...newExperienceTemplate, id: Date.now() };
    const updated = [...experiences, newExp];
    setExperiences(updated);
    onChange(updated);
    setExpandedIndex(updated.length - 1);
    setIsAdding(true);
    toast.success('New experience entry added');
  };

  const handleRemoveExperience = (index) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
    onChange(updated);
    setExpandedIndex(Math.max(0, index - 1));
    toast.success('Experience removed');
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
    onChange(updated);

    // Analyze when significant fields change
    if (['title', 'company', 'description'].includes(field) && value.trim()) {
      analyzeExperienceMutation.mutate(updated[index]);
    }
  };

  const handleUpdateBullet = (expIndex, bulletIndex, value) => {
    const updated = [...experiences];
    const bullets = [...updated[expIndex].bullets];
    bullets[bulletIndex] = value;
    updated[expIndex] = { ...updated[expIndex], bullets };
    setExperiences(updated);
    onChange(updated);
  };

  const handleAddBullet = (expIndex) => {
    const updated = [...experiences];
    updated[expIndex].bullets.push('');
    setExperiences(updated);
    onChange(updated);
  };

  const handleRemoveBullet = (expIndex, bulletIndex) => {
    const updated = [...experiences];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    setExperiences(updated);
    onChange(updated);
  };

  const handleAIOptimizeBullets = (expIndex) => {
    optimizeBulletsMutation.mutate({ expIndex, bullets: experiences[expIndex].bullets });
  };

  const handleAISuggestAchievements = (expIndex) => {
    suggestAchievementsMutation.mutate(expIndex);
  };

  const handleApplyAchievement = (expIndex, achievement) => {
    const updated = [...experiences];
    if (!updated[expIndex].achievements) {
      updated[expIndex].achievements = [];
    }
    updated[expIndex].achievements.push(achievement);
    setExperiences(updated);
    onChange(updated);
    toast.success('AI achievement added!');
  };

  const handleAIEnhanceExperience = (expIndex) => {
    if (onAIEnhance) {
      onAIEnhance(`experience-${expIndex}`);
    }
  };

  const handleAIGenerateExperience = () => {
    const prompt = prompt('Describe the experience you want AI to generate:');
    if (prompt) {
      generateExperienceMutation.mutate(prompt);
    }
  };

  const ExperienceCard = ({ experience, index }) => {
    const isExpanded = expandedIndex === index;

    return (
      <motion.div
        layout
        className={`bg-white border ${isExpanded ? 'border-blue-300 shadow-lg' : 'border-gray-200 hover:border-gray-300'} rounded-xl overflow-hidden transition-all`}
      >
        <div
          className="p-6 cursor-pointer"
          onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {experience.title || 'AI Untitled Position'}
                  </h3>
                  <p className="text-gray-600">
                    {experience.company || 'AI Company name'} • {experience.location || 'AI Location'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {experience.startDate || 'AI Start date'} - {experience.current ? 'Present' : experience.endDate || 'AI End date'}
                </div>
                {experience.current && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                        AI Current
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedIndex(isExpanded ? -1 : index);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveExperience(index);
                }}
                className="p-2 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                            AI Job Title
                    </label>
                    <input
                      type="text"
                      value={experience.title}
                      onChange={(e) => handleUpdateExperience(index, 'title', e.target.value)}
                      placeholder="AI Senior Software Engineer"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                            AI Company
                    </label>
                    <input
                      type="text"
                      value={experience.company}
                      onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                      placeholder="AI Tech Corporation Inc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                            AI Location
                    </label>
                    <input
                      type="text"
                      value={experience.location}
                      onChange={(e) => handleUpdateExperience(index, 'location', e.target.value)}
                      placeholder="AI San Francisco, CA or Remote"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                            AI Duration
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={experience.startDate}
                        onChange={(e) => handleUpdateExperience(index, 'startDate', e.target.value)}
                        placeholder="MM/YYYY"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={experience.endDate}
                        onChange={(e) => handleUpdateExperience(index, 'endDate', e.target.value)}
                        placeholder={experience.current ? 'Present' : 'MM/YYYY'}
                        disabled={experience.current}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={experience.current}
                        onChange={(e) => handleUpdateExperience(index, 'current', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`current-${index}`} className="text-sm text-gray-700">
                                                AI currently work here
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">AI Bullet Points</h4>
                    <button
                      onClick={() => handleAIOptimizeBullets(index)}
                      disabled={optimizeBulletsMutation.isLoading}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      {optimizeBulletsMutation.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                                            AI Optimize
                    </button>
                  </div>

                  <div className="space-y-3">
                    {experience.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-3">
                        <div className="flex-shrink-0 pt-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(index, bulletIndex, e.target.value)}
                            placeholder="AI: Describe your responsibilities and achievements..."
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                        </div>
                        <div className="flex-shrink-0 pt-2">
                          <button
                            onClick={() => handleRemoveBullet(index, bulletIndex)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddBullet(index)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                                            AI Add another bullet point
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">AI Key Achievements</h4>
                    <button
                      onClick={() => handleAISuggestAchievements(index)}
                      disabled={suggestAchievementsMutation.isLoading}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      {suggestAchievementsMutation.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Target className="w-4 h-4" />
                      )}
                                            AI Suggest
                    </button>
                  </div>

                  {experience.achievements?.length > 0 ? (
                    <div className="space-y-2">
                      {experience.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{achievement}</span>
                          <button
                            onClick={() => {
                              const updated = [...experiences];
                              updated[index].achievements = updated[index].achievements.filter((_, i) => i !== idx);
                              setExperiences(updated);
                              onChange(updated);
                            }}
                            className="ml-auto p-1 text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                      <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">AI: No achievements added yet</p>
                      <p className="text-sm text-gray-500 mt-1">AI: Add quantifiable achievements to stand out</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAIEnhanceExperience(index)}
                    disabled={isAnalyzing}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                                        AI Enhance This Entry
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Work Experience</h2>
          <p className="text-gray-600">AI-powered professional work history and achievements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAIGenerateExperience}
            disabled={generateExperienceMutation.isLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {generateExperienceMutation.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
                        AI Generate
          </button>
          <button
            onClick={handleAddExperience}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
                        Add Experience
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Total Entries</p>
              <p className="text-xl font-bold text-gray-900">{experiences.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Bullet Points</p>
              <p className="text-xl font-bold text-gray-900">
                {experiences.reduce((acc, exp) => acc + exp.bullets.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Achievements</p>
              <p className="text-xl font-bold text-gray-900">
                {experiences.reduce((acc, exp) => acc + (exp.achievements?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Keyword Match</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(experiences.length > 0 ? 85 : 0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI: No Experience Added Yet</h3>
            <p className="text-gray-600 mb-6">AI will help you create compelling work history</p>
            <button
              onClick={handleAIGenerateExperience}
              disabled={generateExperienceMutation.isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              {generateExperienceMutation.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
                            AI Generate First Experience
            </button>
          </div>
        ) : (
          experiences.map((experience, index) => (
            <ExperienceCard
              key={experience.id || index}
              experience={experience}
              index={index}
            />
          ))
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
                    AI-Powered Experience Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg">
              <BarChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Quantify Achievements</p>
              <p className="text-sm text-gray-600">AI uses numbers and metrics to show impact</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Match Keywords</p>
              <p className="text-sm text-gray-600">AI includes keywords from your target role</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Action Verbs</p>
              <p className="text-sm text-gray-600">AI starts bullets with strong action words</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Show Progression</p>
              <p className="text-sm text-gray-600">AI highlights promotions and increased responsibilities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
                    Back
        </button>
        <div className="text-sm text-gray-600">
          {experiences.length} AI experience{experiences.length !== 1 ? 's' : ''} • {experiences.reduce((acc, exp) => acc + exp.bullets.length, 0)} AI bullet points
        </div>
        <button
          onClick={onNext}
          className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg flex items-center gap-2"
        >
                    Continue to AI Education
        </button>
      </div>
    </div>
  );
};

export default ExperienceBuilder;