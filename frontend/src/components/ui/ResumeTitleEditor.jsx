// ------------------- ResumeTitleEditor.jsx -------------------
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Type, Sparkles, Target, Briefcase, Cpu, TrendingUp, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

const ResumeTitleEditor = ({ currentTitle, onSave, onClose }) => {
  const [title, setTitle] = useState(currentTitle);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const inputRef = useRef(null);

  // AI Title Suggestions Mutation
  const titleSuggestionsMutation = useMutation({
    mutationFn: async (currentTitle) => {
      const response = await fetch('/api/ai/title/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTitle })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions);
    },
    onError: (error) => {
      console.error('Title suggestions error:', error);
      setSuggestions([]);
    }
  });

  // Generate New Title Mutation
  const generateTitleMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/title/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTitle: title })
      });

      if (!response.ok) {
        throw new Error('Failed to generate title');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setTitle(data.title);
      toast.success('AI generated a new title!');
    },
    onError: (error) => {
      toast.error('Failed to generate title');
      console.error('Title generation error:', error);
    }
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    titleSuggestionsMutation.mutate(currentTitle);
  }, []);

  const handleApplySuggestion = (suggestion) => {
    setTitle(suggestion.text);
    setSelectedSuggestion(suggestion);
    toast.success('AI suggestion applied');
  };

  const handleSaveClick = () => {
    if (title.trim() && title !== currentTitle) {
      onSave(title.trim());
    } else {
      toast.success('Title unchanged');
      onClose();
    }
  };

  const handleGenerateNew = () => {
    generateTitleMutation.mutate();
  };

  const getToneConfig = (toneType) => {
    const configs = {
      professional: { color: 'from-blue-500 to-cyan-500', icon: Briefcase, description: 'Formal, corporate language' },
      modern: { color: 'from-purple-500 to-pink-500', icon: TrendingUp, description: 'Current, up-to-date' },
      creative: { color: 'from-emerald-500 to-teal-500', icon: Sparkles, description: 'Innovative, engaging' },
      targeted: { color: 'from-amber-500 to-orange-500', icon: Target, description: 'Role-specific, focused' }
    };
    return configs[toneType] || configs.professional;
  };

  return (
    <div className="bg-white rounded-2xl">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
              <Type className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Title Editor</h2>
              <p className="text-gray-600">AI-powered title optimization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Current Title</p>
          <p className="text-xl font-bold text-gray-900">{currentTitle}</p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
                        New Resume Title
            <span className="ml-2 text-xs text-gray-500">(Max 60 characters)</span>
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 60))}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
              placeholder="Enter a descriptive resume title..."
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              {title.length}/60
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className={`text-sm ${title.length > 50 ? 'text-amber-600' : 'text-gray-500'}`}>
              {title.length > 50 ? 'Getting long' : 'Good length'}
            </div>
            <button
              onClick={handleGenerateNew}
              disabled={generateTitleMutation.isLoading}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {generateTitleMutation.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generateTitleMutation.isLoading ? 'AI Generating...' : 'Generate with AI'}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">AI Suggestions</h3>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Smart titles based on AI analysis</span>
            </div>
          </div>

          {titleSuggestionsMutation.isLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">AI is generating smart title suggestions...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <p className="text-gray-600">No AI suggestions available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => {
                const config = getToneConfig(suggestion.type);
                const Icon = config.icon;

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleApplySuggestion(suggestion)}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedSuggestion === suggestion ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${config.color}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 capitalize">{suggestion.type}</span>
                      </div>
                      {selectedSuggestion === suggestion && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{suggestion.text}</p>
                    <p className="text-xs text-gray-500 mt-2">{config.description}</p>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">💡 AI Title Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Include your target role or industry (AI-optimized)</li>
            <li>• Add year for current resumes (AI-suggested)</li>
            <li>• Use keywords from job description (AI-extracted)</li>
            <li>• Keep it under 50 characters for readability</li>
            <li>• Avoid special characters and excessive punctuation</li>
          </ul>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
                        Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setTitle(currentTitle);
                setSelectedSuggestion(null);
                toast.success('Changes reset');
              }}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                            Reset
            </button>
            <button
              onClick={handleSaveClick}
              disabled={!title.trim() || title === currentTitle}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
                            Save AI Title
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTitleEditor;