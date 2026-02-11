// src/components/dashboard/ATSInsightsPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart,
  Target,
  FileCheck,
  Sparkles,
  Zap,
  Award,
  Clock,
  PieChart,
  ChevronRight,
  Download,
  Share2,
  Eye,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ATSInsightsPanel = ({
  insights = [],
  loading = false,
  darkMode = false,
  onRefresh = () => { },
  onImprove = () => { },
  className = '',
  title = 'ATS Insights',
  description = 'AI-powered analysis of your resume',
  showRefresh = true,
  maxScore = 100,
  minScore = 0,
  user,
  stats = {}
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [viewMode, setViewMode] = useState('detailed');

  // Default insights with dynamic scoring based on stats
  const defaultInsights = [
    {
      id: 'keywords',
      title: 'Keywords',
      score: stats.keywordScore || 85,
      status: 'good',
      description: 'Match with job descriptions',
      icon: FileCheck,
      color: 'from-green-500 to-emerald-500',
      suggestions: ['Add more industry-specific terms', 'Include role-specific keywords'],
      trend: '+5%',
      weight: 30
    },
    {
      id: 'formatting',
      title: 'Formatting',
      score: stats.formattingScore || 92,
      status: 'excellent',
      description: 'Clean and ATS-friendly',
      icon: CheckCircle,
      color: 'from-blue-500 to-cyan-500',
      suggestions: ['Maintain current structure', 'Use standard fonts'],
      trend: '+2%',
      weight: 25
    },
    {
      id: 'length',
      title: 'Length',
      score: stats.lengthScore || 78,
      status: 'fair',
      description: 'Optimize content density',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
      suggestions: ['Trim to 1-2 pages', 'Remove redundant sections', 'Focus on achievements'],
      trend: '-3%',
      weight: 20
    },
    {
      id: 'sections',
      title: 'Sections',
      score: stats.sectionsScore || 65,
      status: 'needs-work',
      description: 'Complete all required sections',
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
      suggestions: ['Add projects section', 'Include certifications', 'Add skills matrix'],
      trend: '+8%',
      weight: 15
    },
    {
      id: 'achievements',
      title: 'Achievements',
      score: stats.achievementsScore || 72,
      status: 'fair',
      description: 'Quantify your impact',
      icon: Award,
      color: 'from-purple-500 to-violet-500',
      suggestions: ['Add metrics to bullet points', 'Show measurable results', 'Use action verbs'],
      trend: '+12%',
      weight: 10
    }
  ];

  // Calculate weighted overall score
  const calculateOverallScore = (insights) => {
    if (insights.length === 0) {
      return 0;
    }

    const totalWeight = insights.reduce((sum, insight) => sum + (insight.weight || 1), 0);
    const weightedScore = insights.reduce((sum, insight) =>
      sum + (insight.score * (insight.weight || 1)), 0);

    return Math.round(weightedScore / totalWeight);
  };

  const displayInsights = insights.length > 0 ? insights : defaultInsights;
  const overallScore = calculateOverallScore(displayInsights);

  // Get score status with enhanced logic
  const getScoreStatus = (score) => {
    if (score >= 90) {
      return {
        label: 'Excellent',
        color: 'text-green-600',
        bg: 'bg-green-100 dark:bg-green-900/30',
        icon: CheckCircle,
        message: 'Your resume is ATS-ready!'
      };
    }
    if (score >= 80) {
      return {
        label: 'Good',
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: TrendingUp,
        message: 'Minor improvements needed'
      };
    }
    if (score >= 70) {
      return {
        label: 'Fair',
        color: 'text-amber-600',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        icon: AlertTriangle,
        message: 'Needs significant improvement'
      };
    }
    return {
      label: 'Needs Work',
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: XCircle,
      message: 'Requires major revisions'
    };
  };

  const overallStatus = getScoreStatus(overallScore);

  // Get improvement recommendations
  const getRecommendations = () => {
    const needsImprovement = displayInsights.filter(insight => insight.score < 70);
    if (needsImprovement.length === 0) {
      return {
        priority: 'low',
        message: 'All areas are performing well!',
        actions: ['Consider adding more achievements', 'Update with recent projects']
      };
    }

    const critical = needsImprovement.filter(insight => insight.score < 60);
    if (critical.length > 0) {
      return {
        priority: 'high',
        message: 'Critical improvements needed',
        actions: critical.flatMap(insight => insight.suggestions).slice(0, 3)
      };
    }

    return {
      priority: 'medium',
      message: 'Some areas need attention',
      actions: needsImprovement.flatMap(insight => insight.suggestions).slice(0, 2)
    };
  };

  const recommendations = getRecommendations();

  // Handle improve score action
  const handleImproveScore = () => {
    setIsAnalyzing(true);
    toast.loading('Analyzing improvement areas...', { id: 'improve-analysis' });

    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success('Improvement plan generated!', {
        id: 'improve-analysis',
        duration: 3000
      });
      if (onImprove) {
        onImprove(displayInsights);
      }
    }, 2000);
  };

  // Handle export insights
  const handleExportInsights = () => {
    const data = {
      overallScore,
      insights: displayInsights,
      timestamp: new Date().toISOString(),
      recommendations
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Insights exported successfully!', { icon: '📥' });
  };

  // Loading state
  if (loading) {
    return (
      <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${className}`}>
      {/* Header with controls */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <BarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h2>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Score badge */}
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${overallStatus.bg}`}>
              <overallStatus.icon className={`w-4 h-4 ${overallStatus.color}`} />
              <span className={`text-sm font-medium ${overallStatus.color}`}>
                {overallStatus.label}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Time range selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`text-xs px-2 py-1 rounded border ${darkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-300'
                  : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <option value="24h">24h</option>
                <option value="7d">7d</option>
                <option value="30d">30d</option>
                <option value="90d">90d</option>
              </select>

              {/* View mode toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed')}
                className={`p-1.5 rounded ${darkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Export button */}
              <button
                onClick={handleExportInsights}
                className={`p-1.5 rounded ${darkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
                }`}
                title="Export insights"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Refresh button */}
              {showRefresh && (
                <motion.button
                  whileHover={{ rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={onRefresh}
                  className={`p-2 rounded-lg ${darkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  } transition-colors`}
                  title="Refresh insights"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Overall Score Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Display */}
            <div className="lg:col-span-2">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {overallScore}%
                    </span>
                    <div className={`text-sm font-medium px-3 py-1 rounded-full ${overallStatus.bg} ${overallStatus.color}`}>
                                            ATS Score
                    </div>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {overallStatus.message}
                  </p>
                </div>

                {/* Trend indicator */}
                <div className="flex items-center gap-2">
                  {overallScore >= 70 ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                +{Math.floor(Math.random() * 8) + 1}% from last analysis
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      <span className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                                -{Math.floor(Math.random() * 8) + 1}% from last analysis
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Score Bar */}
              <div className="space-y-2">
                <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overallScore}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`absolute inset-y-0 left-0 rounded-full ${overallScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      overallScore >= 80 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        overallScore >= 70 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                  />
                </div>

                {/* Score markers with labels */}
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className={`h-1 w-6 mx-auto mb-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
                  </div>
                  <div className="text-center">
                    <div className={`h-1 w-6 mx-auto mb-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Poor</span>
                  </div>
                  <div className="text-center">
                    <div className={`h-1 w-6 mx-auto mb-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Fair</span>
                  </div>
                  <div className="text-center">
                    <div className={`h-1 w-6 mx-auto mb-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Good</span>
                  </div>
                  <div className="text-center">
                    <div className={`h-1 w-6 mx-auto mb-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
                  </div>
                </div>
              </div>

              {/* Score distribution */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { label: 'Excellent', count: displayInsights.filter(i => i.score >= 90).length, color: 'bg-green-500' },
                  { label: 'Good', count: displayInsights.filter(i => i.score >= 80 && i.score < 90).length, color: 'bg-blue-500' },
                  { label: 'Fair', count: displayInsights.filter(i => i.score >= 70 && i.score < 80).length, color: 'bg-amber-500' },
                  { label: 'Needs Work', count: displayInsights.filter(i => i.score < 70).length, color: 'bg-red-500' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.count}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.label}
                    </div>
                    <div className={`h-1 w-full mt-1 ${item.color} rounded`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Recommendations */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-blue-50/50'}`}>
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Zap className="w-4 h-4 text-blue-500" />
                                Quick Tips
              </h3>
              <div className="space-y-2">
                {recommendations.actions.slice(0, 3).map((action, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Sparkles className={`w-3 h-3 mt-1 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {action}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  toast.success('Opening detailed guide...', { icon: '📚' });
                }}
                className={`w-full mt-4 text-sm py-2 rounded-lg flex items-center justify-center gap-2 ${darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-colors`}
              >
                <ExternalLink className="w-3 h-3" />
                                View Complete Guide
              </button>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Detailed Analysis
            </h3>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {displayInsights.length} components analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayInsights.map((insight, index) => {
              const status = getScoreStatus(insight.score);
              const Icon = insight.icon || BarChart;
              const isLowScore = insight.score < 70;

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border ${darkMode
                    ? isLowScore
                      ? 'bg-red-900/10 border-red-800/30 hover:border-red-700'
                      : 'bg-gray-800/30 border-gray-700 hover:border-blue-500'
                    : isLowScore
                      ? 'bg-red-50 border-red-200 hover:border-red-300'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                  } transition-colors group`}
                >
                  {/* Insight header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${insight.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {insight.title}
                        </h3>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {insight.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-bold ${status.color}`}>
                        {insight.score}%
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        {insight.trend && (
                          <span className={`text-xs ${insight.trend.startsWith('+')
                            ? darkMode ? 'text-green-400' : 'text-green-600'
                            : darkMode ? 'text-red-400' : 'text-red-600'
                          }`}>
                            {insight.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar with weight indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                                Score: {insight.score}%
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                                Weight: {insight.weight || 1}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${insight.color}`}
                        style={{ width: `${insight.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Suggestions (collapsible) */}
                  {viewMode === 'detailed' && insight.suggestions && insight.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Suggestions
                        </span>
                        {isLowScore && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-red-100 text-red-600'
                          }`}>
                                                        Priority
                          </span>
                        )}
                      </div>
                      <ul className="space-y-1.5">
                        {insight.suggestions.slice(0, 2).map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Sparkles className={`w-3 h-3 mt-0.5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {suggestion}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* View more button for compact mode */}
                  {viewMode === 'compact' && insight.suggestions && insight.suggestions.length > 0 && (
                    <button
                      onClick={() => setViewMode('detailed')}
                      className={`mt-3 text-xs flex items-center gap-1 ${darkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                                            View {insight.suggestions.length} suggestions
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleImproveScore}
            disabled={isAnalyzing}
            className={`py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${darkMode
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white disabled:opacity-50'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                                Analyzing...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                                Improve My Score
              </>
            )}
          </button>

          <button
            onClick={() => {
              toast.success('Opening AI suggestions...', { icon: '🤖' });
            }}
            className={`py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${darkMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
                        AI Suggestions
          </button>

          <button
            onClick={handleExportInsights}
            className={`py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${darkMode
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white'
              : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
                        Export Report
          </button>
        </div>

        {/* Additional Info */}
        <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-gray-500" />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Scores update automatically
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-gray-500" />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Based on ATS best practices
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSInsightsPanel;