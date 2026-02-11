// ------------------- ResumeStatsDashboard.jsx -------------------
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, TrendingUp, Target, CheckCircle, AlertCircle, Clock, Zap, Sparkles, Award, Shield, Users, FileText, Briefcase, GraduationCap, Cpu } from 'lucide-react';

const ResumeStatsDashboard = ({ resumeData, atsScore = 0, suggestions = [], keywords = [], onEnhance, onClose }) => {
  const stats = useMemo(() => {
    const completion = calculateCompletion(resumeData);
    const sections = getSectionStats(resumeData);
    const strength = calculateStrength(resumeData, atsScore);

    return {
      completion,
      sections,
      strength,
      keywordCount: keywords.length,
      suggestionCount: suggestions.length,
      lastUpdated: resumeData.updatedAt ? new Date(resumeData.updatedAt) : new Date()
    };
  }, [resumeData, atsScore, keywords, suggestions]);

  function calculateCompletion(data) {
    const requiredSections = ['personalInfo', 'summary', 'experience', 'education', 'skills'];
    const optionalSections = ['projects', 'certifications', 'languages', 'references'];

    let completed = 0;
    let total = 0;

    // Check required sections
    requiredSections.forEach(section => {
      total++;
      if (section === 'personalInfo') {
        const hasName = data.personalInfo?.fullName?.trim().length > 0;
        const hasEmail = data.personalInfo?.email?.trim().length > 0;
        if (hasName && hasEmail) {
          completed++;
        }
      } else if (section === 'summary') {
        if (data.summary?.trim().length > 50) {
          completed++;
        }
      } else if (section === 'experience') {
        if (data.experience?.length > 0) {
          completed++;
        }
      } else if (section === 'education') {
        if (data.education?.length > 0) {
          completed++;
        }
      } else if (section === 'skills') {
        if (data.skills?.length > 0) {
          completed++;
        }
      }
    });

    // Check optional sections (weighted less)
    optionalSections.forEach(section => {
      total += 0.5;
      if (data[section]?.length > 0) {
        completed += 0.5;
      }
    });

    return Math.round((completed / total) * 100);
  }

  function getSectionStats(data) {
    return [
      { icon: FileText, label: 'Summary', completed: data.summary?.trim().length > 50, weight: 'high' },
      { icon: Briefcase, label: 'Experience', completed: data.experience?.length > 0, weight: 'high' },
      { icon: GraduationCap, label: 'Education', completed: data.education?.length > 0, weight: 'high' },
      { icon: Cpu, label: 'Skills', completed: data.skills?.length > 0, weight: 'high' },
      { icon: Users, label: 'Projects', completed: data.projects?.length > 0, weight: 'medium' },
      { icon: Award, label: 'Certifications', completed: data.certifications?.length > 0, weight: 'low' },
      { icon: Shield, label: 'Languages', completed: data.languages?.length > 0, weight: 'low' }
    ];
  }

  function calculateStrength(data, atsScore) {
    let score = atsScore * 0.4; // 40% from ATS

    // Content quality (30%)
    if (data.experience?.length >= 3) {
      score += 15;
    }
    if (data.skills?.length >= 10) {
      score += 10;
    }
    if (data.summary?.trim().length > 100) {
      score += 5;
    }

    // Completeness (30%)
    const completion = calculateCompletion(data);
    score += (completion * 0.3);

    return Math.min(100, Math.round(score));
  }

  const getScoreColor = (score) => {
    if (score >= 80) {
      return 'text-green-600 bg-green-100';
    }
    if (score >= 60) {
      return 'text-yellow-600 bg-yellow-100';
    }
    return 'text-red-600 bg-red-100';
  };

  const getScoreBarColor = (score) => {
    if (score >= 80) {
      return 'from-green-500 to-emerald-500';
    }
    if (score >= 60) {
      return 'from-yellow-500 to-amber-500';
    }
    return 'from-red-500 to-orange-500';
  };

  const QuickWinCard = ({ icon: Icon, title, description, action, buttonText }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <button
            onClick={action}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
              <BarChart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resume Stats Dashboard</h2>
              <p className="text-gray-600">AI-powered insights and optimization recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="sr-only">Close</span>
            <span className="text-2xl">×</span>
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Overall Score</h3>
                  <p className="text-gray-600">Based on ATS, content quality, and completeness</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold ${getScoreColor(stats.strength)}`}>
                  {stats.strength}/100
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Strength</span>
                    <span className="text-sm font-medium text-gray-900">{stats.strength}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.strength}%` }}
                      className={`h-full bg-gradient-to-r ${getScoreBarColor(stats.strength)}`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">ATS Compatibility</span>
                    <span className="text-sm font-medium text-gray-900">{atsScore}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${atsScore}%` }}
                      className={`h-full bg-gradient-to-r ${getScoreBarColor(atsScore)}`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Completion</span>
                    <span className="text-sm font-medium text-gray-900">{stats.completion}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.completion}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Completion */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Section Completion</h3>
              <div className="space-y-4">
                {stats.sections.map((section, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${section.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        <section.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{section.label}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${section.weight === 'high' ? 'bg-blue-100 text-blue-700' : section.weight === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                          {section.weight} priority
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                      <span className="text-sm text-gray-600">
                        {section.completed ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Keywords</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.keywordCount}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <p className="mt-2 text-xs text-gray-600">Optimized for ATS</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Suggestions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.suggestionCount}</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <p className="mt-2 text-xs text-gray-600">AI improvements available</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Last Updated</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.lastUpdated.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  {stats.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Quick Wins</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.max(3 - suggestions.filter(s => s.type === 'critical').length, 0)}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-amber-600" />
                </div>
                <p className="mt-2 text-xs text-gray-600">Easy improvements</p>
              </div>
            </div>

            {/* Quick Wins */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Wins</h3>
              <div className="space-y-3">
                {suggestions.slice(0, 3).map((suggestion, idx) => (
                  <QuickWinCard
                    key={idx}
                    icon={suggestion.type === 'critical' ? AlertCircle : Zap}
                    title={suggestion.title}
                    description={suggestion.description}
                    action={() => onEnhance && onEnhance(suggestion.section)}
                    buttonText="Fix Now"
                  />
                ))}

                {suggestions.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Great job! 🎉</h4>
                    <p className="text-gray-600">Your resume is looking strong with no critical issues.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Optimization Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => onEnhance && onEnhance('ats')}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:shadow-sm text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Boost ATS Score</p>
                      <p className="text-sm text-gray-600">Add missing keywords</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onEnhance && onEnhance('summary')}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:shadow-sm text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Enhance Summary</p>
                      <p className="text-sm text-gray-600">AI-powered rewrite</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>Last analyzed: {stats.lastUpdated.toLocaleString()}</p>
            <p className="mt-1">Resume ID: {resumeData._id?.slice(0, 8)}...</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                            Close
            </button>
            <button
              onClick={() => onEnhance && onEnhance()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
                            AI Enhance All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeStatsDashboard;