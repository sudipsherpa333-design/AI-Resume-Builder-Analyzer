import React, { useState } from 'react';
import { ArrowLeft, Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BuilderHeaderBar = ({
    resumeTitle = 'My Resume',
    onTitleChange = () => { },
    saveStatus = 'idle', // idle, saving, saved, error
    onGoBack = () => { },
    unsavedChanges = false
}) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(resumeTitle);

    const handleTitleSubmit = () => {
        if (title.trim() && title !== resumeTitle) {
            onTitleChange(title);
        } else {
            setTitle(resumeTitle);
        }
        setIsEditing(false);
    };

    const handleGoBack = () => {
        if (unsavedChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                onGoBack();
            }
        } else {
            onGoBack();
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-6 py-4 flex items-center justify-between">
                {/* Left: Go Back */}
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Go Back
                </button>

                {/* Center: Resume Title (Editable) */}
                <div className="flex-1 flex justify-center items-center mx-8">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleSubmit}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleTitleSubmit();
                                    if (e.key === 'Escape') {
                                        setTitle(resumeTitle);
                                        setIsEditing(false);
                                    }
                                }}
                                autoFocus
                                maxLength={50}
                                className="px-3 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                            />
                            <span className="text-xs text-gray-500">{title.length}/50</span>
                        </div>
                    ) : (
                        <h1
                            onClick={() => setIsEditing(true)}
                            className="text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors"
                            title="Click to edit title"
                        >
                            {resumeTitle}
                        </h1>
                    )}
                </div>

                {/* Right: Save Status */}
                <div className="flex items-center gap-3">
                    {saveStatus === 'saving' && (
                        <div className="flex items-center gap-2 text-amber-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Saving...</span>
                        </div>
                    )}
                    {saveStatus === 'saved' && (
                        <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Saved</span>
                        </div>
                    )}
                    {saveStatus === 'error' && (
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Save failed</span>
                        </div>
                    )}
                    {unsavedChanges && saveStatus === 'idle' && (
                        <div className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Unsaved changes</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuilderHeaderBar;
