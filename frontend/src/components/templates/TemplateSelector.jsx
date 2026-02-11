// src/components/templates/TemplateSelector.jsx
import React, { useState, useMemo } from 'react';
import { X, Check, Sparkles, Star, Zap, Layout, Palette } from 'lucide-react';

// Fixed constant name - changed TEMPlATE_CATEGORIES to TEMPLATE_CATEGORIES
const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: Layout, count: 8 },
  { id: 'professional', label: 'Professional', icon: Star, count: 4 },
  { id: 'modern', label: 'Modern', icon: Zap, count: 2 },
  { id: 'creative', label: 'Creative', icon: Sparkles, count: 1 },
  { id: 'minimalist', label: 'Minimalist', icon: Palette, count: 1 }
];

const TEMPLATES = [
  {
    id: 'corporate-pro',
    name: 'Corporate Pro',
    category: 'professional',
    description: 'Professional corporate template for executives',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=500&fit=crop',
    color: 'bg-blue-500',
    popular: true,
    free: true
  },
  {
    id: 'modern-executive',
    name: 'Modern Executive',
    category: 'modern',
    description: 'Clean and contemporary design',
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=500&fit=crop',
    color: 'bg-indigo-500',
    popular: true,
    free: true
  },
  // ... other templates
];

const TemplateSelector = ({ isOpen, onClose, currentTemplate, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = searchQuery === '' ||
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a Template</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Select a template to start building your resume
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <category.icon size={18} />
                <span className="font-medium">{category.label}</span>
                <span className="text-sm opacity-80">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`group relative border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${currentTemplate === template.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`w-32 h-40 ${template.color} rounded-lg transform rotate-6 shadow-lg`} />
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                    </div>
                    {template.popular && (
                      <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded">
                                                Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      {template.free ? (
                        <span className="px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg">
                                                    Free
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg">
                                                    Pro
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelect(template.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentTemplate === template.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {currentTemplate === template.id ? (
                        <div className="flex items-center gap-2">
                          <Check size={16} />
                          <span>Selected</span>
                        </div>
                      ) : (
                        'Select Template'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;