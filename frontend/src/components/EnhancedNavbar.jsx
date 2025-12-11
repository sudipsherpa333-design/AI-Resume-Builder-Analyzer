// src/components/builder/EnhancedNavbar.jsx
import React, { useState } from 'react';
import {
    FaSave,
    FaDownload,
    FaEye,
    FaEyeSlash,
    FaRobot,
    FaFilePdf,
    FaFileWord,
    FaFileImage,
    FaPrint,
    FaTemplate,
    FaPencilAlt,
    FaEdit,
    FaRegClock,
    FaHome,
    FaUser,
    FaChartLine,
    FaSignOutAlt,
    FaCaretDown,
    FaQuestionCircle,
    FaPlus,
    FaShareAlt,
    FaDatabase,
    FaSpinner,
    FaArrowLeft
} from 'react-icons/fa';

const EnhancedNavbar = ({
    onTogglePreview,
    showPreview,
    onToggleAI,
    showAI,
    onSave,
    onExport,
    resumeTitle,
    onTitleChange,
    lastSaved,
    isSaving,
    user,
    logout,
    navigate
}) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleExport = (format) => {
        setShowExportMenu(false);
        onExport(format);
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="container mx-auto px-4">
                {/* Top Row */}
                <div className="flex items-center justify-between py-3">
                    {/* Left: Logo and Title */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                                <FaPencilAlt className="text-white text-lg" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Resume Builder</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FaRegClock />
                                    <span>Auto-save {lastSaved || 'Just now'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Resume Title */}
                        <div className="relative group">
                            <input
                                type="text"
                                value={resumeTitle}
                                onChange={(e) => onTitleChange(e.target.value)}
                                className="text-lg font-semibold bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-2 py-1 min-w-[200px]"
                                placeholder="Untitled Resume"
                            />
                            <FaEdit className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600" />
                        </div>
                    </div>

                    {/* Center: Main Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition flex items-center gap-2"
                            >
                                <FaDownload />
                                <span>Export</span>
                                <FaCaretDown />
                            </button>
                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                                    >
                                        <FaFilePdf className="text-red-500" />
                                        <div>
                                            <div className="font-medium">PDF Document</div>
                                            <div className="text-xs text-gray-500">Best for printing</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleExport('doc')}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t"
                                    >
                                        <FaFileWord className="text-blue-500" />
                                        <div>
                                            <div className="font-medium">Word Document</div>
                                            <div className="text-xs text-gray-500">Editable format</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleExport('image')}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t"
                                    >
                                        <FaFileImage className="text-green-500" />
                                        <div>
                                            <div className="font-medium">Image</div>
                                            <div className="text-xs text-gray-500">PNG format</div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/templates')}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
                        >
                            <FaTemplate />
                            <span>Templates</span>
                        </button>
                    </div>

                    {/* Right: User Menu */}
                    <div className="flex items-center gap-4">
                        {/* Toggle Buttons */}
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={onToggleAI}
                                className={`p-2 rounded-lg transition ${showAI ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                                title="AI Assistant"
                            >
                                <FaRobot />
                            </button>
                            <button
                                onClick={onTogglePreview}
                                className={`p-2 rounded-lg transition ${showPreview ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
                                title="Live Preview"
                            >
                                {showPreview ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </div>
                                <div className="text-left hidden md:block">
                                    <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
                                    <div className="text-xs text-gray-500">{user?.email || 'user@example.com'}</div>
                                </div>
                                <FaCaretDown />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                    <div className="p-4 border-b">
                                        <div className="font-medium text-gray-900">{user?.name || 'User'}</div>
                                        <div className="text-sm text-gray-500">{user?.email || 'user@example.com'}</div>
                                    </div>
                                    <button
                                        onClick={() => { navigate('/dashboard'); setShowUserMenu(false); }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                                    >
                                        <FaHome />
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t"
                                    >
                                        <FaUser />
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={() => { navigate('/analyzer'); setShowUserMenu(false); }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t"
                                    >
                                        <FaChartLine />
                                        AI Analyzer
                                    </button>
                                    <button
                                        onClick={() => { logout(); navigate('/login'); setShowUserMenu(false); }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t text-red-600"
                                    >
                                        <FaSignOutAlt />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Quick Actions */}
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <FaArrowLeft />
                            Back to Dashboard
                        </button>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <button
                            onClick={() => navigate('/builder-home')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <FaPlus />
                            New Resume
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <FaShareAlt />
                            Share
                        </button>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-green-600">
                            <FaDatabase />
                            <span>Auto-save enabled</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                            <FaQuestionCircle />
                            <span>Help</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default EnhancedNavbar;