// src/components/ui/FloatingActionButtons.jsx - Enhanced
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Eye, EyeOff, Download, Settings, Layout,
  FileText, Sparkles, Maximize2, Minimize2,
  Plus, Wand2, Type, Palette, BarChart3
} from 'lucide-react';

const FloatingActionButtons = ({
  onSave,
  onPreview,
  onAI,
  onExport,
  onTemplate,
  onFullScreen,
  onStats,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const mainActions = [
    {
      icon: isExpanded ? <EyeOff /> : <Eye />,
      label: isExpanded ? 'Hide Preview' : 'Show Preview',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: onPreview
    },
    {
      icon: <Sparkles />,
      label: 'AI Assistant',
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: onAI
    },
    {
      icon: <Download />,
      label: 'Export',
      color: 'bg-emerald-600 hover:bg-emerald-700',
      onClick: onExport
    }
  ];

  const secondaryActions = [
    {
      icon: <Layout />,
      label: 'Templates',
      color: 'bg-amber-600 hover:bg-amber-700',
      onClick: onTemplate
    },
    {
      icon: <BarChart3 />,
      label: 'Statistics',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      onClick: onStats
    },
    {
      icon: <Type />,
      label: 'Typography',
      color: 'bg-pink-600 hover:bg-pink-700',
      onClick: () => { }
    },
    {
      icon: <Palette />,
      label: 'Colors',
      color: 'bg-rose-600 hover:bg-rose-700',
      onClick: () => { }
    },
    {
      icon: <Wand2 />,
      label: 'Magic Fill',
      color: 'bg-violet-600 hover:bg-violet-700',
      onClick: () => { }
    }
  ];

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
    onFullScreen?.();
  };

  return (
    <div className={`fixed bottom-6 right-6 flex flex-col items-end gap-3 ${className}`}>
      {/* Secondary Actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-2 mb-2"
          >
            {secondaryActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={action.onClick}
                className={`${action.color} text-white p-3 rounded-full shadow-lg flex items-center gap-3 group`}
                title={action.label}
              >
                <span className="w-5 h-5">{action.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1 rounded-lg">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Actions */}
      <div className="flex items-center gap-2">
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullScreen}
          className="bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg"
          title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white p-3 rounded-full shadow-lg flex items-center gap-2"
          title="Save Resume"
        >
          <Save className="w-5 h-5" />
          <span className="text-sm font-medium">Save</span>
        </button>

        {/* Main Action Buttons */}
        {mainActions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`${action.color} text-white p-3 rounded-full shadow-lg`}
            title={action.label}
          >
            <span className="w-5 h-5">{action.icon}</span>
          </button>
        ))}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white p-3 rounded-full shadow-lg"
          title={isExpanded ? 'Show Less' : 'More Options'}
        >
          {isExpanded ? (
            <span className="w-5 h-5">×</span>
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default FloatingActionButtons;