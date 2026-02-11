// src/pages/builder/components/TopActionBar.jsx
import React from 'react';
import PropTypes from 'prop-types';

const TopActionBar = ({
  resumeTitle,
  onTitleChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSaving,
  lastSaved,
  completionPercentage,
  onSave,
  onPreview,
  onTemplateSelect,
  onSidebarToggle,
  isSidebarOpen,
  isMobile,
  onExportPDF,
  onAnalyze,
  onAIAssistant
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <button
          onClick={onSidebarToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Resume Title */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <input
              type="text"
              value={resumeTitle || 'Untitled Resume'}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 min-w-[200px]"
              placeholder="Resume Title"
              maxLength={60}
            />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
          </div>
          <div className="text-xs text-gray-500">
            {resumeTitle?.length || 0}/60
          </div>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 ml-4 border-l border-gray-200 pl-4">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${canUndo
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            {!isMobile && <span className="text-xs">Undo</span>}
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${canRedo
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            {!isMobile && <span className="text-xs">Redo</span>}
          </button>
        </div>

        {/* Template Selector */}
        <button
          onClick={onTemplateSelect}
          className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
          title="Change Template"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span>Template</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Progress Indicator */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
              ></div>
            </div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {Math.round(completionPercentage)}% Complete
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              {Math.round(completionPercentage)}%
            </span>
            <span className="text-xs text-gray-500">Complete</span>
          </div>
        </div>

        {/* Save Status */}
        <div className="hidden md:block">
          {(isSaving) ? (
            <div className="flex items-center gap-1 text-sm text-blue-600 animate-pulse">
              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Saving...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">
                                Last saved
              </span>
              <span className="text-xs font-medium text-gray-700">
                {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-400">
                            Not saved yet
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Button (Mobile Only) */}
          <button
            onClick={onAIAssistant}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="AI Assistant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>

          {/* Analyze Button */}
          {onAnalyze && (
            <button
              onClick={onAnalyze}
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
              title="Analyze Resume"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Analyze</span>
            </button>
          )}

          {/* Export PDF Button */}
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
              title="Export to PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>PDF</span>
            </button>
          )}

          {/* Preview Button */}
          <button
            onClick={onPreview}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            title="Preview (Ctrl+P)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {!isMobile && <span>Preview</span>}
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="Save (Ctrl+S)"
          >
            {isSaving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            {!isMobile && <span>{isSaving ? 'Saving...' : 'Save'}</span>}
          </button>

          {/* Mobile Menu */}
          <div className="md:hidden relative">
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="More options"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

TopActionBar.propTypes = {
  resumeTitle: PropTypes.string,
  onTitleChange: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool,
  lastSaved: PropTypes.instanceOf(Date),
  completionPercentage: PropTypes.number,
  onSave: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  onTemplateSelect: PropTypes.func.isRequired,
  onSidebarToggle: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool,
  onExportPDF: PropTypes.func,
  onAnalyze: PropTypes.func,
  onAIAssistant: PropTypes.func
};

TopActionBar.defaultProps = {
  resumeTitle: 'Untitled Resume',
  isSaving: false,
  completionPercentage: 0,
  isMobile: false,
  isSidebarOpen: true
};

export default TopActionBar;