// src/components/section/SectionManager.jsx
import React, { useState } from 'react';
import { X, GripVertical, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SectionManager = ({
  isOpen,
  onClose,
  sections,
  sectionsOrder,
  onOrderChange,
  darkMode = false
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [previewScale, setPreviewScale] = useState(0.8);

  if (!isOpen) {
    return null;
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newOrder = [...sectionsOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    onOrderChange(newOrder);
    setDraggedIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Manage Sections
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Drag and drop to reorder sections. Toggle visibility as needed.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* Left Panel - Sections List */}
          <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="space-y-3">
              {sectionsOrder.map((sectionId, index) => {
                const section = sections.find(s => s.id === sectionId);
                if (!section) {
                  return null;
                }

                return (
                  <div
                    key={sectionId}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    onDrop={() => handleDrop(index)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${draggedIndex === index
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <button className="cursor-move text-gray-400 hover:text-gray-600">
                      <GripVertical size={20} />
                    </button>

                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.color}`}>
                      <section.icon size={20} className="text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {section.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {section.required ? 'Required' : 'Optional'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Eye size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Preview
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewScale(Math.max(0.5, previewScale - 0.1))}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                                        -
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <button
                    onClick={() => setPreviewScale(Math.min(1, previewScale + 0.1))}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                                        +
                  </button>
                </div>
              </div>

              {/* Preview Container */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 overflow-hidden">
                <div
                  className="mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-transform duration-300"
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top center',
                    maxWidth: '8.5in',
                    maxHeight: '11in'
                  }}
                >
                  {/* Preview Header */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            JOHN DOE
                    </h2>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>📧 john.doe@email.com</span>
                      <span>📱 (123) 456-7890</span>
                      <span>📍 San Francisco, CA</span>
                    </div>
                  </div>

                  {/* Preview Sections */}
                  <div className="space-y-6">
                    {sectionsOrder.slice(0, 4).map((sectionId) => {
                      const section = sections.find(s => s.id === sectionId);
                      if (!section) {
                        return null;
                      }

                      return (
                        <div key={sectionId} className="border-l-4 border-indigo-500 pl-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {section.label.toUpperCase()}
                          </h3>
                          <div className="space-y-2">
                            {section.id === 'summary' && (
                              <p className="text-gray-600 dark:text-gray-400">
                                                                Experienced professional with 5+ years in the industry...
                              </p>
                            )}
                            {section.id === 'experience' && (
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    Senior Developer at TechCorp
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    2020 - Present
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                                        Tips for organizing sections
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Required sections must remain in your resume</li>
                    <li>• Place your strongest sections first</li>
                    <li>• Consider your target audience when ordering</li>
                    <li>• You can hide optional sections from the final output</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                            Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Reset to default order
                  onOrderChange(sections.map(s => s.id));
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                                Reset Order
              </button>
              <button
                onClick={() => {
                  onClose();
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Check size={18} />
                                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SectionManager;