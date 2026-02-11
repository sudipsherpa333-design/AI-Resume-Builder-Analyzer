// src/pages/builder/TemplatesPage.jsx (Simple Version)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import {
  Sparkles, Eye, Star, Heart,
  Check, Filter, Search, Grid,
  List, Download, Palette, Clock
} from 'lucide-react';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      category: 'modern',
      description: 'Clean, professional design with modern typography',
      color: '#3b82f6',
      tags: ['Professional', 'ATS Friendly', 'Modern'],
      isFree: true,
      isPopular: true,
    },
    {
      id: 'classic',
      name: 'Classic',
      category: 'classic',
      description: 'Traditional resume format with elegant design',
      color: '#6b7280',
      tags: ['Traditional', 'Formal', 'Elegant'],
      isFree: true,
      isPopular: false,
    },
    {
      id: 'creative',
      name: 'Creative',
      category: 'creative',
      description: 'Vibrant design for creative professionals',
      color: '#8b5cf6',
      tags: ['Creative', 'Colorful', 'Design'],
      isFree: true,
      isPopular: false,
    },
    {
      id: 'minimal',
      name: 'Minimal',
      category: 'minimal',
      description: 'Clean and minimal design with white space',
      color: '#ffffff',
      tags: ['Minimal', 'Clean', 'Simple'],
      isFree: true,
      isPopular: true,
    },
    {
      id: 'executive',
      name: 'Executive',
      category: 'executive',
      description: 'Sophisticated design for leadership roles',
      color: '#1f2937',
      tags: ['Executive', 'Leadership', 'Professional'],
      isFree: true,
      isPopular: false,
    },
    {
      id: 'technical',
      name: 'Technical',
      category: 'technical',
      description: 'Structured layout for technical roles',
      color: '#059669',
      tags: ['Technical', 'Engineering', 'Structured'],
      isFree: true,
      isPopular: false,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'modern', name: 'Modern' },
    { id: 'classic', name: 'Classic' },
    { id: 'creative', name: 'Creative' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'executive', name: 'Executive' },
    { id: 'technical', name: 'Technical' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template) => {
    toast.success(`Selected "${template.name}" template`);
    navigate('/builder/new', {
      state: {
        selectedTemplate: template.id,
        templateColor: template.color
      }
    });
  };

  const toggleFavorite = (templateId) => {
    setFavorites(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Resume Templates</h1>
              <p className="text-xl text-blue-100">
                Choose a template and start building your perfect resume
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex justify-end mb-6">
            <div className="flex gap-2 bg-white p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Template Preview */}
                  <div
                    className="h-48 flex items-center justify-center"
                    style={{ backgroundColor: template.color + '20' }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: template.color }}
                      >
                        {template.name}
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                      <button
                        onClick={() => toggleFavorite(template.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Heart
                          className={`w-5 h-5 ${favorites.includes(template.id)
                              ? 'text-red-500 fill-current'
                              : 'text-gray-400'
                            }`}
                        />
                      </button>
                    </div>

                    <p className="text-gray-600 mb-4">{template.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Template Preview */}
                    <div
                      className="w-32 h-40 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: template.color + '20' }}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">📄</div>
                        <div
                          className="font-bold"
                          style={{ color: template.color }}
                        >
                          {template.name}
                        </div>
                      </div>
                    </div>

                    {/* Template Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                          <p className="text-gray-600">{template.description}</p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(template.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Heart
                            className={`w-5 h-5 ${favorites.includes(template.id)
                                ? 'text-red-500 fill-current'
                                : 'text-gray-400'
                              }`}
                          />
                        </button>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Use This Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">
                Try selecting a different category
              </p>
            </div>
          )}

          {/* Features */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Our Templates</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">ATS Optimized</h3>
                <p className="text-gray-600">All templates are designed to pass through Applicant Tracking Systems</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Palette className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Fully Customizable</h3>
                <p className="text-gray-600">Change colors, layouts, and fonts to match your style</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple Formats</h3>
                <p className="text-gray-600">Export to PDF, DOCX, and other popular formats</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TemplatesPage;