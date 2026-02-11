// src/components/section/SectionItem.jsx - Enhanced
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Eye, EyeOff, GripVertical,
  CheckCircle, AlertCircle, MoreVertical, Settings,
  Sparkles, Trash2, Copy, ArrowUp, ArrowDown
} from 'lucide-react';

const SectionItem = ({
  title,
  icon,
  isRequired,
  isExpanded,
  completion,
  onToggle,
  onHide,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  children,
  className = ''
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const completionColor = completion === 100 ? 'bg-emerald-500' :
    completion >= 50 ? 'bg-amber-500' :
      'bg-red-500';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Section Header */}
      <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
        {/* Left side - Drag handle & Icon */}
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 cursor-move p-1">
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${completionColor}`} />
                  <span className="text-xs text-gray-500">
                    {completion}% complete
                  </span>
                </div>
                {!isRequired && (
                  <span className="text-xs text-gray-400">• Optional</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Visibility Toggle */}
          <button
            onClick={onHide}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Hide/Show section"
          >
            {isExpanded ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          {/* AI Suggestions Badge */}
          {completion < 100 && (
            <button
              className="p-2 text-purple-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
              title="AI suggestions available"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showOptions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                <div className="py-1">
                  {!isRequired && (
                    <button
                      onClick={() => {
                        onDelete?.();
                        setShowOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove Section
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDuplicate?.();
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-3 h-3" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      onMoveUp?.();
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ArrowUp className="w-3 h-3" />
                    Move Up
                  </button>
                  <button
                    onClick={() => {
                      onMoveDown?.();
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ArrowDown className="w-3 h-3" />
                    Move Down
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-200">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SectionItem;