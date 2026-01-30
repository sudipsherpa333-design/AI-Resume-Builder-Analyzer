// src/components/builder/SummaryPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';

const SummaryPage = ({ data, onUpdate, onSave, aiCredits }) => {
    // 1. useState - Component state
    const [text, setText] = useState(data || '');
    const [isEditing, setIsEditing] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    // 2. useRef - DOM reference (won't trigger re-render)
    const textareaRef = useRef(null);

    // 3. useEffect - Side effects
    useEffect(() => {
        // Calculate word count
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);

        // Auto-save after 2 seconds of inactivity
        const timer = setTimeout(() => {
            if (text !== data) {
                onUpdate(text);
            }
        }, 2000);

        return () => clearTimeout(timer); // Cleanup
    }, [text, data, onUpdate]);

    // 4. useCallback - Memoized function
    const handleAIEnhance = useCallback(async () => {
        if (aiCredits < 5) {
            alert('Not enough credits');
            return;
        }

        // Call AI API
        const enhanced = await enhanceWithAI(text);
        setText(enhanced);
        onUpdate(enhanced);
    }, [text, aiCredits, onUpdate]);

    // 5. useMemo - Memoized value
    const characterCount = useMemo(() => {
        return text.length;
    }, [text]);

    const isTextValid = useMemo(() => {
        return wordCount >= 50 && wordCount <= 200;
    }, [wordCount]);

    // 6. Custom hook usage
    const { isOnline, syncStatus } = useNetworkStatus();

    return (
        <div className="p-6">
            <div className="mb-4">
                <h3 className="text-xl font-bold">Professional Summary</h3>
                <div className="flex gap-4 text-sm text-gray-600">
                    <span>Words: {wordCount}/200</span>
                    <span>Characters: {characterCount}</span>
                    {!isOnline && <span className="text-amber-600">● Offline</span>}
                </div>
            </div>

            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-64 p-4 border rounded-lg"
                placeholder="Write your professional summary..."
            />

            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleAIEnhance}
                    disabled={aiCredits < 5}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                    Enhance with AI ({aiCredits} credits)
                </button>

                <button
                    onClick={() => onSave()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Save
                </button>
            </div>

            {!isTextValid && (
                <p className="mt-2 text-red-600">
                    Summary should be 50-200 words (currently {wordCount})
                </p>
            )}
        </div>
    );
};

export default SummaryPage;