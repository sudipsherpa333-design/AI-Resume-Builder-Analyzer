// src/components/builder/SummaryPage.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAI } from '../../context/AIContext';
import { useResume } from '../../context/ResumeContext';

// Icons
import {
  Sparkles, Target, Wand2, Copy, Check,
  Loader2, Bot, Search, Key, Clipboard,
  ClipboardCheck, BarChart, Users, Shield,
  Cpu, TrendingUp, Edit2, AlertCircle,
  ChevronDown, ChevronUp, Zap, Brain,
  FileText, Hash, RefreshCw, ThumbsUp,
  MessageSquare, GitBranch, Globe, Rocket,
  Star, TrendingDown, Filter, ArrowRight,
  Lightbulb, GitMerge, Cloud, Database,
  Terminal, Server, Code, Smartphone,
  Layers, Palette, PieChart, Settings,
  Maximize2, Minimize2, Eye, EyeOff,
  Type, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Percent, DollarSign, Award, Trophy,
  Volume2, Wind, Coffee, Compass,
  Crown, Diamond, Flame, Heart,
  Moon, Sun, Users as UsersIcon,
  Grid as GridIcon, List as ListIcon,
  Plus, X
} from 'lucide-react';

// AI Assistant Component
const AIAssistant = ({ onSuggest, onOptimize, onGenerate, isAnalyzing }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickSuggestions = [
    { icon: Sparkles, label: 'Generate variants', action: 'generate', color: 'from-purple-500 to-pink-500' },
    { icon: Wand2, label: 'Optimize tone', action: 'optimize', color: 'from-blue-500 to-cyan-500' },
    { icon: Target, label: 'Boost ATS', action: 'boost', color: 'from-green-500 to-emerald-500' },
    { icon: Zap, label: 'Add metrics', action: 'metrics', color: 'from-amber-500 to-orange-500' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900 to-blue-900 text-white rounded-2xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-purple-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl">AI Writing Assistant</h3>
              <p className="text-purple-200 text-sm">Powered by GPT-4</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:text-purple-200 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickSuggestions.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.action === 'generate') onGenerate?.();
                else if (item.action === 'optimize') onOptimize?.('tone');
                else if (item.action === 'boost') onOptimize?.('ats');
                else if (item.action === 'metrics') onSuggest?.('metrics');
              }}
              disabled={isAnalyzing}
              className={`bg-gradient-to-r ${item.color} hover:opacity-90 backdrop-blur-sm p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-white/20">
                <div className="grid grid-cols-3 gap-3">
                  <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg flex flex-col items-center gap-1">
                    <Type className="w-4 h-4" />
                    <span className="text-xs">Professional</span>
                  </button>
                  <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg flex flex-col items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs">Impactful</span>
                  </button>
                  <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg flex flex-col items-center gap-1">
                    <Crown className="w-4 h-4" />
                    <span className="text-xs">Executive</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Keyword Analyzer Component
const KeywordAnalyzer = ({ keywords, summary, onAddKeyword }) => {
  const matchedKeywords = useMemo(() => {
    if (!summary || !keywords.length) return [];
    const summaryLower = summary.toLowerCase();
    return keywords.filter(keyword =>
      summaryLower.includes(keyword.toLowerCase())
    );
  }, [keywords, summary]);

  const missingKeywords = useMemo(() => {
    if (!keywords.length) return [];
    const summaryLower = summary?.toLowerCase() || '';
    return keywords.filter(keyword =>
      !summaryLower.includes(keyword.toLowerCase())
    );
  }, [keywords, summary]);

  const matchPercentage = useMemo(() => {
    if (!keywords.length) return 0;
    return Math.round((matchedKeywords.length / keywords.length) * 100);
  }, [keywords.length, matchedKeywords.length]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Keyword Intelligence</h3>
            <p className="text-gray-400 text-sm">Real-time ATS optimization</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{matchPercentage}%</div>
          <div className="text-sm text-gray-400">Match Score</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Keyword Coverage</span>
            <span>{matchedKeywords.length}/{keywords.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchPercentage}%` }}
              className={`h-2 rounded-full ${matchPercentage >= 80 ? 'bg-green-500' :
                matchPercentage >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
            />
          </div>
        </div>

        {matchedKeywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Matched Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.slice(0, 8).map((keyword, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAddKeyword?.(keyword)}
                  className="px-3 py-1.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-sm transition-colors"
                >
                  <Check className="w-3 h-3 inline mr-1" />
                  {keyword}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {missingKeywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Missing Keywords ({missingKeywords.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.slice(0, 6).map((keyword, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAddKeyword?.(keyword)}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {keyword}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Writing Metrics Component
const WritingMetrics = ({ summary }) => {
  const metrics = useMemo(() => {
    if (!summary) return {};

    const words = summary.trim().split(/\s+/).filter(w => w.length > 0);
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Calculate readability (simplified)
    const syllables = words.reduce((acc, word) => {
      const syllableCount = word.toLowerCase().replace(/[^aeiouy]/g, '')
        .replace(/[aeiouy]{2,}/g, '')
        .length || 1;
      return acc + syllableCount;
    }, 0);

    const readability = Math.max(0, Math.min(100,
      206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length)
    ));

    // Calculate power words
    const powerWords = ['led', 'managed', 'increased', 'reduced', 'optimized',
      'developed', 'implemented', 'achieved', 'improved', 'created'];
    const powerWordCount = powerWords.filter(word =>
      summary.toLowerCase().includes(word)
    ).length;

    // Calculate metrics presence
    const hasPercentages = /(\d+%)/.test(summary);
    const hasNumbers = /\d+/.test(summary);
    const hasDollars = /\$[\d,]+/.test(summary);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      readability: Math.round(readability),
      powerWordCount,
      hasPercentages,
      hasNumbers,
      hasDollars,
      averageSentenceLength: words.length / sentences.length || 0
    };
  }, [summary]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart className="w-5 h-5 text-blue-600" />
        Writing Analytics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{metrics.wordCount || 0}</div>
          <div className="text-sm text-gray-600">Words</div>
          <div className={`text-xs mt-1 ${metrics.wordCount >= 50 && metrics.wordCount <= 120 ? 'text-green-600' :
            metrics.wordCount > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
            {!metrics.wordCount ? 'Empty' :
              metrics.wordCount < 50 ? 'Too short' :
                metrics.wordCount > 200 ? 'Too long' :
                  'Optimal'}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{metrics.sentenceCount || 0}</div>
          <div className="text-sm text-gray-600">Sentences</div>
          <div className="text-xs mt-1 text-gray-600">
            Avg. {metrics.averageSentenceLength?.toFixed(1) || '0.0'} words
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{metrics.readability || 0}</div>
          <div className="text-sm text-gray-600">Readability</div>
          <div className={`text-xs mt-1 ${metrics.readability >= 60 ? 'text-green-600' :
            metrics.readability > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
            {metrics.readability >= 80 ? 'Very Easy' :
              metrics.readability >= 60 ? 'Standard' :
                'Complex'}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{metrics.powerWordCount || 0}</div>
          <div className="text-sm text-gray-600">Power Words</div>
          <div className={`text-xs mt-1 ${metrics.powerWordCount >= 3 ? 'text-green-600' :
            metrics.powerWordCount > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
            {metrics.powerWordCount >= 5 ? 'Excellent' :
              metrics.powerWordCount >= 3 ? 'Good' :
                'Needs more'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className={`p-3 rounded-lg text-center ${metrics.hasNumbers ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
          <div className="text-sm font-medium">Numbers</div>
          <div className="text-xs">{metrics.hasNumbers ? '✓ Present' : '✗ Missing'}</div>
        </div>
        <div className={`p-3 rounded-lg text-center ${metrics.hasPercentages ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
          <div className="text-sm font-medium">Percentages</div>
          <div className="text-xs">{metrics.hasPercentages ? '✓ Present' : '✗ Missing'}</div>
        </div>
        <div className={`p-3 rounded-lg text-center ${metrics.hasDollars ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
          <div className="text-sm font-medium">$ Figures</div>
          <div className="text-xs">{metrics.hasDollars ? '✓ Present' : '✗ Missing'}</div>
        </div>
      </div>
    </div>
  );
};

// AI Variants Component
const AIVariants = ({ variants, activeVariant, onSelect, onRegenerate, isGenerating }) => {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <GitMerge className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Generated Variants</h3>
            <p className="text-gray-600 text-sm">Multiple AI-generated summaries to choose from</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <GridIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {isGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Variants Yet</h4>
          <p className="text-gray-600 mb-4">Click "Generate with AI" to create optimized summary variants</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {variants.map((variant, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect?.(index)}
              className={`p-4 rounded-xl border text-left transition-all ${activeVariant === index
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeVariant === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {variant.tone || 'Professional'}
                  </span>
                </div>
                {variant.score && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {variant.score}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 line-clamp-4 mb-3 leading-relaxed">
                {variant.text || variant.content || variant}
              </p>
              {variant.keywords && (
                <div className="flex items-center gap-2">
                  {variant.keywords.slice(0, 2).map((kw, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
              {activeVariant === index && (
                <div className="flex justify-end mt-3">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${activeVariant === index
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-gray-200'
                }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onSelect?.(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activeVariant === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {index + 1}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{variant.tone || 'Professional'}</span>
                      {variant.score && (
                        <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {variant.score}% match
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onSelect?.(index)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {activeVariant === index ? 'Selected ✓' : 'Select'}
                    </button>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{variant.text || variant.content || variant}</p>
                  {variant.keywords && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {variant.keywords.slice(0, 5).map((kw, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main SummaryPage Component
const SummaryPage = ({ resumeData, onUpdate, onNext, onBack }) => {
  // AI Context
  const {
    extractKeywords,
    optimizeSummary,
    generateSummaryVariants,
    optimizeContent,
    isAnalyzing,
    aiSuggestions,
    globalJobDescription,
    globalKeywords,
    targetRole,
    setGlobalJD,
    setTargetRole
  } = useAI();

  // Resume Context
  const { currentResume } = useResume();

  // State Management
  const [summary, setSummary] = useState(resumeData?.summary || '');
  const [jobDescription, setJobDescription] = useState(globalJobDescription || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [jdKeywords, setJdKeywords] = useState(globalKeywords || []);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [keywordMatchScore, setKeywordMatchScore] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [generationMode, setGenerationMode] = useState('ats');
  const [jdWordCount, setJdWordCount] = useState(0);
  const [summaryVariants, setSummaryVariants] = useState([]);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [activeVariant, setActiveVariant] = useState(null);
  const [optimizationHistory, setOptimizationHistory] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [writingStyle, setWritingStyle] = useState('balanced');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');

  // Refs
  const textareaRef = useRef(null);
  const jdTextareaRef = useRef(null);
  const historyIndexRef = useRef(-1);

  // Calculate counts
  useEffect(() => {
    const words = summary.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharacterCount(summary.length);

    // Update keyword match when summary changes
    if (jdKeywords.length > 0) {
      calculateKeywordMatch(jdKeywords);
    }
  }, [summary, jdKeywords]);

  // Calculate JD word count
  useEffect(() => {
    const words = jobDescription.trim().split(/\s+/).filter(word => word.length > 0);
    setJdWordCount(words.length);
  }, [jobDescription]);

  // Initialize from global state
  useEffect(() => {
    if (globalJobDescription) {
      setJobDescription(globalJobDescription);
    }
    if (globalKeywords?.length > 0) {
      setJdKeywords(globalKeywords);
      calculateKeywordMatch(globalKeywords);
    }
  }, [globalJobDescription, globalKeywords]);

  // Calculate keyword match
  const calculateKeywordMatch = useCallback((keywords) => {
    if (!summary.trim() || !keywords.length) {
      setKeywordMatchScore(0);
      setMissingKeywords([]);
      return;
    }

    const summaryLower = summary.toLowerCase();
    const missing = keywords.filter(keyword =>
      !summaryLower.includes(keyword.toLowerCase())
    );

    setMissingKeywords(missing.slice(0, 15));

    const matched = keywords.filter(keyword =>
      summaryLower.includes(keyword.toLowerCase())
    ).length;

    const score = keywords.length > 0
      ? Math.round((matched / keywords.length) * 100)
      : 0;

    setKeywordMatchScore(score);
  }, [summary]);

  // Calculate ATS score
  const calculateATSScore = useMemo(() => {
    if (!summary.trim()) return 0;

    let score = 50; // Base score

    // Word count optimization
    if (wordCount >= 50 && wordCount <= 120) score += 20;
    else if (wordCount > 0 && wordCount < 200) score += 10;

    // Action verbs check
    const actionVerbs = ['led', 'managed', 'developed', 'increased', 'reduced',
      'optimized', 'implemented', 'achieved', 'improved', 'created',
      'transformed', 'scaled', 'delivered', 'built', 'engineered'];
    const actionVerbCount = actionVerbs.filter(verb => summary.toLowerCase().includes(verb)).length;
    score += Math.min(actionVerbCount * 3, 15);

    // Numbers and metrics check
    const hasNumbers = /\d+/.test(summary);
    const hasPercentages = /(\d+%)/.test(summary);
    const hasDollars = /\$[\d,]+/.test(summary);

    if (hasNumbers) score += 5;
    if (hasPercentages) score += 8;
    if (hasDollars) score += 7;

    // Keyword match contribution
    score += Math.min(keywordMatchScore * 0.15, 20);

    // Readability check
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWords = wordCount / Math.max(sentences.length, 1);
    if (avgWords >= 12 && avgWords <= 25) score += 10;

    // Length penalty/boost
    if (wordCount < 30) score -= 15;
    if (wordCount > 200) score -= 10;

    return Math.min(Math.max(score, 0), 100);
  }, [summary, wordCount, keywordMatchScore]);

  // Extract keywords from JD
  const extractKeywordsFromJD = useCallback(async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description first');
      return;
    }

    setIsExtracting(true);
    try {
      const result = await extractKeywords(jobDescription);

      if (result?.keywords?.length > 0) {
        setJdKeywords(result.keywords);
        setGlobalJD(jobDescription);

        // Auto-detect role
        if (result.suggestedRole && !targetRole) {
          setTargetRole(result.suggestedRole);
        }

        // Calculate initial match
        calculateKeywordMatch(result.keywords);

        toast.success(`Extracted ${result.keywords.length} keywords`);
      } else {
        toast.error('No keywords could be extracted');
      }
    } catch (error) {
      console.error('Keyword extraction error:', error);
      toast.error('Failed to extract keywords');
    } finally {
      setIsExtracting(false);
    }
  }, [jobDescription, extractKeywords, setGlobalJD, targetRole, setTargetRole, calculateKeywordMatch]);

  // Generate AI summary variants
  const generateAISummary = useCallback(async () => {
    if (!resumeData) {
      toast.error('Please complete your resume information first');
      return;
    }

    setIsGenerating(true);
    setShowVariants(true);

    try {
      const result = await generateSummaryVariants(
        currentResume || resumeData,
        jobDescription,
        {
          count: 3,
          tone: selectedTone,
          length: selectedLength,
          mode: generationMode
        }
      );

      if (result?.variants?.length > 0) {
        setSummaryVariants(result.variants);
        setActiveVariant(0);

        // Show the best variant by default
        const bestIndex = result.bestMatchIndex || 0;
        setSummary(result.variants[bestIndex]?.text || result.variants[bestIndex]?.content || '');

        toast.success('AI generated 3 summary variants');
      } else {
        toast.error('Failed to generate summary variants');
      }
    } catch (error) {
      console.error('Summary generation error:', error);
      toast.error('AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [resumeData, currentResume, jobDescription, selectedTone, selectedLength, generationMode, generateSummaryVariants]);

  // Optimize existing summary
  const optimizeSummaryWithAI = useCallback(async (optimizationType = 'full') => {
    if (!summary.trim()) {
      toast.error('Please write or generate a summary first');
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizeSummary(summary, jobDescription);

      if (result?.optimized) {
        // Save current summary to history
        setOptimizationHistory(prev => {
          const newHistory = [...prev, summary];
          historyIndexRef.current = newHistory.length - 1;
          return newHistory.slice(-10); // Keep last 10 versions
        });

        setSummary(result.optimized);
        calculateKeywordMatch(jdKeywords);

        toast.success('AI optimized your summary');
      } else {
        toast.error('Optimization failed');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  }, [summary, jobDescription, optimizeSummary, jdKeywords, calculateKeywordMatch]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text = summary) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    }
  }, [summary]);

  // Handle keyword click
  const handleKeywordClick = useCallback((keyword) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = summary.substring(0, start) + keyword + summary.substring(end);
      setSummary(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start + keyword.length;
        textarea.selectionEnd = start + keyword.length;
      }, 0);
    }
  }, [summary]);

  // Apply variant
  const applyVariant = useCallback((index) => {
    if (summaryVariants[index]?.text || summaryVariants[index]?.content) {
      const variantText = summaryVariants[index]?.text || summaryVariants[index]?.content;
      setSummary(variantText);
      setActiveVariant(index);
      setOptimizationHistory(prev => [...prev, summary]);
      toast.success('Applied AI variant');
    }
  }, [summaryVariants, summary]);

  // Undo last change
  const undoChange = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      setSummary(optimizationHistory[historyIndexRef.current]);
      toast.success('Undo successful');
    } else {
      toast.info('No more changes to undo');
    }
  }, [optimizationHistory]);

  // Redo change
  const redoChange = useCallback(() => {
    if (historyIndexRef.current < optimizationHistory.length - 1) {
      historyIndexRef.current += 1;
      setSummary(optimizationHistory[historyIndexRef.current]);
      toast.success('Redo successful');
    } else {
      toast.info('No more changes to redo');
    }
  }, [optimizationHistory]);

  // Auto-detect role
  const autoDetectRole = useCallback(() => {
    if (!jobDescription.trim()) return;

    // Simple role detection
    const rolePatterns = [
      /(senior|junior|lead|principal|staff)?\s*(software|full.?stack|front.?end|back.?end|web|mobile|devops|cloud|security)?\s*(engineer|developer)/gi,
      /(product|project|program|technical)?\s*(manager|lead|director|head)/gi,
      /(data|business|systems|security|qa)?\s*(analyst|scientist|architect|specialist|consultant)/gi,
      /(marketing|sales|account|customer|business)\s*(manager|director|executive|representative)/gi
    ];

    for (const pattern of rolePatterns) {
      const match = jobDescription.match(pattern);
      if (match && match[0]) {
        setTargetRole(match[0].trim());
        toast.success(`Detected role: ${match[0].trim()}`);
        return;
      }
    }

    toast.info('Could not auto-detect role');
  }, [jobDescription, setTargetRole]);

  // AI suggestions for summary
  const summarySuggestions = useMemo(() => {
    const suggestions = [];

    if (wordCount < 50) {
      suggestions.push({
        text: `Summary is short (${wordCount}/50 words). Add more achievements and skills.`,
        priority: 'high',
        icon: AlertCircle,
        action: () => generateAISummary(),
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      });
    }

    if (wordCount > 200) {
      suggestions.push({
        text: `Summary is long (${wordCount}/200 words). Consider being more concise.`,
        priority: 'medium',
        icon: AlertCircle,
        action: () => optimizeSummaryWithAI('concise'),
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
      });
    }

    if (keywordMatchScore < 50 && jdKeywords.length > 0) {
      suggestions.push({
        text: `Low keyword match (${keywordMatchScore}%). Add more JD keywords.`,
        priority: 'high',
        icon: Target,
        action: () => optimizeSummaryWithAI('keywords'),
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      });
    }

    if (!/\d+/.test(summary)) {
      suggestions.push({
        text: 'Add quantifiable achievements with numbers.',
        priority: 'medium',
        icon: BarChart,
        action: () => optimizeSummaryWithAI('metrics'),
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      });
    }

    // Add AI suggestions from context
    aiSuggestions
      ?.filter(s => s.section === 'summary')
      .slice(0, 2)
      .forEach(suggestion => {
        suggestions.push({
          text: suggestion.description || suggestion.title,
          priority: suggestion.priority || 'medium',
          icon: suggestion.priority === 'high' ? AlertCircle : Lightbulb,
          action: () => optimizeSummaryWithAI(),
          color: suggestion.priority === 'high' ? 'text-red-600' : 'text-blue-600',
          bgColor: suggestion.priority === 'high' ? 'bg-red-50' : 'bg-blue-50',
          borderColor: suggestion.priority === 'high' ? 'border-red-200' : 'border-blue-200'
        });
      });

    return suggestions;
  }, [wordCount, keywordMatchScore, jdKeywords.length, summary, aiSuggestions, generateAISummary, optimizeSummaryWithAI]);

  // Save and continue
  const handleSaveAndContinue = useCallback(() => {
    onUpdate?.({ summary });
    onNext?.();
  }, [summary, onUpdate, onNext]);

  // Regenerate variants
  const regenerateVariants = useCallback(() => {
    setShowVariants(false);
    setTimeout(() => {
      generateAISummary();
      setShowVariants(true);
    }, 100);
  }, [generateAISummary]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                AI
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI-Powered Summary Generator</h1>
              <p className="text-gray-700 mt-1">
                Advanced AI analyzes job descriptions and creates optimized summaries with real-time feedback
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              GPT-4 Turbo
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full flex items-center gap-2">
              <Shield className="w-4 h-4" />
              ATS Optimized
            </div>
          </div>
        </div>

        {/* AI Assistant Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Writing Assistant Active</h3>
                <p className="text-purple-100">
                  Real-time analysis, keyword optimization, and AI-generated variants available
                </p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold">{calculateATSScore}%</div>
                <div className="text-sm text-purple-200">ATS Score</div>
              </div>
              <div className="w-px h-10 bg-white/30"></div>
              <div className="text-right">
                <div className="text-2xl font-bold">{keywordMatchScore}%</div>
                <div className="text-sm text-purple-200">Keyword Match</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Job Description & AI Assistant */}
        <div className="space-y-6">
          <AIAssistant
            onSuggest={(type) => {
              if (type === 'metrics') optimizeSummaryWithAI('metrics');
              else if (type === 'tone') optimizeSummaryWithAI('tone');
            }}
            onOptimize={optimizeSummaryWithAI}
            onGenerate={generateAISummary}
            isAnalyzing={isAnalyzing || isGenerating}
          />

          {/* Job Description Input */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-blue-600" />
                Job Description Analysis
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{jdWordCount} words</span>
                <button
                  onClick={() => setJobDescription('')}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={jdTextareaRef}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here for AI analysis..."
                className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500 bg-white font-medium"
                rows={8}
              />

              {!jobDescription.trim() && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-br from-gray-50 to-white rounded-xl">
                  <div className="text-center p-8">
                    <Clipboard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">Paste Job Description</p>
                    <p className="text-gray-600 text-sm">
                      AI will extract keywords, detect role requirements, and optimize your summary
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* JD Actions */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={extractKeywordsFromJD}
                disabled={!jobDescription.trim() || isExtracting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">AI Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Analyze with AI</div>
                      <div className="text-xs opacity-90">Extract keywords & requirements</div>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Target Role & Industry */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Senior Software Engineer"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Select Industry</option>
                  <option value="tech">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="marketing">Marketing</option>
                  <option value="education">Education</option>
                </select>
              </div>
            </div>
          </div>

          {/* Keyword Analyzer */}
          {jdKeywords.length > 0 && (
            <KeywordAnalyzer
              keywords={jdKeywords}
              summary={summary}
              onAddKeyword={handleKeywordClick}
            />
          )}
        </div>

        {/* Middle Column - Summary Editor & AI Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Editor with AI Controls */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Professional Summary</h3>
                  <p className="text-sm text-gray-600">
                    Write or let AI generate your summary
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Word Count</div>
                  <div className="text-xl font-bold text-gray-900">{wordCount}</div>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={undoChange}
                    disabled={historyIndexRef.current <= 0}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    title="Undo"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={redoChange}
                    disabled={historyIndexRef.current >= optimizationHistory.length - 1}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                    title="Redo"
                  >
                    <RefreshCw className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => copyToClipboard()}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title="Copy"
                  >
                    {isCopied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Generation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Mode
                </label>
                <select
                  value={generationMode}
                  onChange={(e) => setGenerationMode(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="ats">ATS Optimized</option>
                  <option value="concise">Concise & Impactful</option>
                  <option value="executive">Executive Level</option>
                  <option value="technical">Technical Focus</option>
                  <option value="creative">Creative & Engaging</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Writing Tone
                </label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="professional">Professional</option>
                  <option value="confident">Confident</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="analytical">Analytical</option>
                  <option value="visionary">Visionary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length
                </label>
                <select
                  value={selectedLength}
                  onChange={(e) => setSelectedLength(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="short">Short (50-80 words)</option>
                  <option value="medium">Medium (80-120 words)</option>
                  <option value="detailed">Detailed (120-200 words)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <select
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="balanced">Balanced</option>
                  <option value="achievement">Achievement Focused</option>
                  <option value="skill">Skill Focused</option>
                  <option value="story">Story Driven</option>
                </select>
              </div>
            </div>

            {/* Summary Text Editor */}
            <div className="mb-6">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Start writing your professional summary here, or click 'Generate with AI'..."
                  className="w-full h-72 p-6 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500 bg-white font-medium text-lg leading-relaxed"
                  rows={10}
                />
              </div>

              {/* AI Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={generateAISummary}
                  disabled={isGenerating || isAnalyzing}
                  className="p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <div className="text-left">
                        <div className="font-bold text-lg">AI Generating...</div>
                        <div className="text-sm opacity-90">Creating 3 optimized variants</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Brain className="w-8 h-8" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-lg">Generate with AI</div>
                        <div className="text-sm opacity-90">
                          {jdKeywords.length > 0
                            ? `Using ${jdKeywords.length} extracted keywords`
                            : 'AI-powered summary creation'
                          }
                        </div>
                      </div>
                    </>
                  )}
                </button>

                <button
                  onClick={() => optimizeSummaryWithAI('full')}
                  disabled={!summary.trim() || isOptimizing || isAnalyzing}
                  className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-lg hover:shadow-xl"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <div className="text-left">
                        <div className="font-bold text-lg">AI Optimizing...</div>
                        <div className="text-sm opacity-90">Enhancing with AI intelligence</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-8 h-8" />
                      <div className="text-left">
                        <div className="font-bold text-lg">Optimize with AI</div>
                        <div className="text-sm opacity-90">
                          {jdKeywords.length > 0
                            ? `Boost keyword match & ATS score`
                            : 'Improve tone & impact'
                          }
                        </div>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick AI Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => optimizeSummaryWithAI('metrics')}
                disabled={!summary.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center gap-2"
              >
                <BarChart className="w-4 h-4" />
                <span>Add Metrics</span>
              </button>
              <button
                onClick={() => optimizeSummaryWithAI('keywords')}
                disabled={!summary.trim() || jdKeywords.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Add Keywords</span>
              </button>
              <button
                onClick={() => optimizeSummaryWithAI('tone')}
                disabled={!summary.trim()}
                className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Improve Tone</span>
              </button>
            </div>

            {/* AI Suggestions */}
            {summarySuggestions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  AI Suggestions
                </h4>
                <div className="space-y-3">
                  {summarySuggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-4 p-4 rounded-xl border ${suggestion.bgColor} ${suggestion.borderColor}`}
                    >
                      <div className={`mt-1 ${suggestion.color}`}>
                        <suggestion.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{suggestion.text}</p>
                      </div>
                      <button
                        onClick={suggestion.action}
                        className={`text-sm font-medium ${suggestion.color} hover:opacity-80 whitespace-nowrap`}
                      >
                        Apply AI Fix →
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Generated Variants */}
          {showVariants && (
            <AIVariants
              variants={summaryVariants}
              activeVariant={activeVariant}
              onSelect={applyVariant}
              onRegenerate={regenerateVariants}
              isGenerating={isGenerating}
            />
          )}

          {/* AI Insights Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WritingMetrics
              summary={summary}
            />

            {/* AI Analysis Dashboard */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Analysis</h3>
                    <p className="text-gray-400 text-sm">Real-time insights</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{calculateATSScore}</div>
                  <div className="text-sm text-gray-400">Score</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ATS Compatibility</span>
                    <span>{calculateATSScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateATSScore}%` }}
                      className={`h-2 rounded-full ${calculateATSScore >= 80 ? 'bg-green-500' :
                        calculateATSScore >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Keyword Optimization</span>
                    <span>{keywordMatchScore}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${keywordMatchScore}%` }}
                      className={`h-2 rounded-full ${keywordMatchScore >= 80 ? 'bg-green-500' :
                        keywordMatchScore >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Impact Score</span>
                    <span>{calculateATSScore}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateATSScore}%` }}
                      className={`h-2 rounded-full ${calculateATSScore >= 80 ? 'bg-green-500' :
                        calculateATSScore >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="font-medium mb-3">AI Recommendations</h4>
                <div className="space-y-2">
                  {summarySuggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <div className="mt-1">•</div>
                      <span>{suggestion.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-8 py-3 border border-gray-300 text-gray-800 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
        >
          <span>← Back</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onUpdate?.({ summary })}
            className="px-8 py-3 border border-gray-300 text-gray-800 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
          >
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleSaveAndContinue}
            disabled={!summary.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;