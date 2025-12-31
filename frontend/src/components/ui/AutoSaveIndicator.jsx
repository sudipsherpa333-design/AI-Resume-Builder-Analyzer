// src/components/ui/AutoSaveIndicator.jsx
import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export const AutoSaveIndicator = ({ saveStatus, lastSaveTime, autoSaveEnabled, onToggleAutoSave }) => {
    return (
        <div className="fixed bottom-4 left-4 z-50">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                {saveStatus === 'saving' ? (
                    <Loader2 size={12} className="animate-spin text-amber-500" />
                ) : (
                    <Check size={12} className="text-green-500" />
                )}
                <span className="text-xs text-gray-600">
                    {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                </span>
                <button
                    onClick={onToggleAutoSave}
                    className="text-xs text-blue-600 hover:text-blue-700 ml-2"
                >
                    {autoSaveEnabled ? 'Auto: ON' : 'Auto: OFF'}
                </button>
            </div>
        </div>
    );
};

export default AutoSaveIndicator;