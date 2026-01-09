// src/hooks/useAIAssistant.js
import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export const useAIAssistant = (options = {}) => {
    const {
        initialCredits = 150,
        onEnhance = null,
        onTemplateApply = null,
        showNotifications = true
    } = options;

    const [isOpen, setIsOpen] = useState(false);
    const [credits, setCredits] = useState(initialCredits);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    const processingTimeoutRef = useRef(null);

    // Open/close assistant
    const openAssistant = useCallback((sectionId = null) => {
        setIsOpen(true);
        if (sectionId) {
            setActiveSection(sectionId);
        }
        console.log('🤖 [useAIAssistant] Assistant opened', { sectionId });
    }, []);

    const closeAssistant = useCallback(() => {
        setIsOpen(false);
        setConversation([]);
        setIsProcessing(false);
        if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
        }
        console.log('🤖 [useAIAssistant] Assistant closed');
    }, []);

    // Enhance section with AI
    const enhanceSection = useCallback(async (sectionId, currentData, type = 'improve') => {
        if (credits < 5) {
            if (showNotifications) {
                toast.error('Insufficient AI credits! Minimum 5 required.');
            }
            return { success: false, error: 'Insufficient credits' };
        }

        if (isProcessing) {
            console.warn('🤖 [useAIAssistant] Already processing');
            return { success: false, error: 'Already processing' };
        }

        setIsProcessing(true);

        try {
            console.log('🤖 [useAIAssistant] Enhancing section:', { sectionId, type });

            // Deduct credits
            setCredits(prev => prev - 5);

            // Simulate API call with timeout
            return await new Promise((resolve) => {
                processingTimeoutRef.current = setTimeout(() => {
                    let enhancedData = null;

                    switch (type) {
                        case 'improve':
                            enhancedData = enhanceContent(sectionId, currentData);
                            break;
                        case 'expand':
                            enhancedData = expandContent(sectionId, currentData);
                            break;
                        case 'summarize':
                            enhancedData = summarizeContent(sectionId, currentData);
                            break;
                        case 'keywords':
                            enhancedData = addKeywords(sectionId, currentData);
                            break;
                        default:
                            enhancedData = enhanceContent(sectionId, currentData);
                    }

                    setIsProcessing(false);

                    // Call external handler if provided
                    if (onEnhance) {
                        onEnhance(sectionId, enhancedData);
                    }

                    // Add to conversation
                    setConversation(prev => [...prev, {
                        type: 'enhancement',
                        sectionId,
                        timestamp: new Date(),
                        creditsUsed: 5
                    }]);

                    // Show success notification
                    if (showNotifications) {
                        toast.success(`Section enhanced successfully! (-5 credits)`);
                    }

                    console.log('✅ [useAIAssistant] Enhancement complete:', { sectionId });
                    resolve({ success: true, data: enhancedData });
                }, 2000);
            });

        } catch (error) {
            console.error('❌ [useAIAssistant] Enhancement failed:', error);
            setIsProcessing(false);

            // Refund credits on error
            setCredits(prev => prev + 5);

            if (showNotifications) {
                toast.error('AI enhancement failed. Credits refunded.');
            }

            return { success: false, error: error.message };
        }
    }, [credits, isProcessing, onEnhance, showNotifications]);

    // Apply template
    const applyTemplate = useCallback(async (sectionId, templateName) => {
        if (credits < 3) {
            if (showNotifications) {
                toast.error('Insufficient AI credits! Minimum 3 required.');
            }
            return { success: false, error: 'Insufficient credits' };
        }

        setIsProcessing(true);

        try {
            console.log('🤖 [useAIAssistant] Applying template:', { sectionId, templateName });

            // Deduct credits
            setCredits(prev => prev - 3);

            // Simulate API call
            return await new Promise((resolve) => {
                setTimeout(() => {
                    const templateData = getSectionTemplate(sectionId, templateName);

                    setIsProcessing(false);

                    // Call external handler if provided
                    if (onTemplateApply) {
                        onTemplateApply(sectionId, templateData);
                    }

                    // Add to conversation
                    setConversation(prev => [...prev, {
                        type: 'template',
                        sectionId,
                        templateName,
                        timestamp: new Date(),
                        creditsUsed: 3
                    }]);

                    if (showNotifications) {
                        toast.success(`Template applied successfully! (-3 credits)`);
                    }

                    console.log('✅ [useAIAssistant] Template applied:', { sectionId, templateName });
                    resolve({ success: true, data: templateData });
                }, 1500);
            });

        } catch (error) {
            console.error('❌ [useAIAssistant] Template application failed:', error);
            setIsProcessing(false);
            setCredits(prev => prev + 3);

            if (showNotifications) {
                toast.error('Template application failed. Credits refunded.');
            }

            return { success: false, error: error.message };
        }
    }, [credits, onTemplateApply, showNotifications]);

    // Get suggestions for section
    const getSuggestions = useCallback(async (sectionId, currentData) => {
        if (isProcessing) return [];

        try {
            console.log('🤖 [useAIAssistant] Getting suggestions for:', sectionId);

            // Simulate AI suggestions
            const sectionSuggestions = generateSuggestions(sectionId, currentData);
            setSuggestions(sectionSuggestions);

            return sectionSuggestions;
        } catch (error) {
            console.error('❌ [useAIAssistant] Failed to get suggestions:', error);
            return [];
        }
    }, [isProcessing]);

    // Add credits (for testing/demo)
    const addCredits = useCallback((amount) => {
        setCredits(prev => prev + amount);
        if (showNotifications) {
            toast.success(`Added ${amount} AI credits!`);
        }
    }, [showNotifications]);

    // Reset assistant
    const resetAssistant = useCallback(() => {
        setConversation([]);
        setSuggestions([]);
        setActiveSection(null);
        setIsProcessing(false);
        console.log('🤖 [useAIAssistant] Assistant reset');
    }, []);

    // Toggle assistant
    const toggleAssistant = useCallback(() => {
        setIsOpen(prev => !prev);
        if (isOpen) {
            setConversation([]);
        }
        console.log('🤖 [useAIAssistant] Assistant toggled:', !isOpen);
    }, [isOpen]);

    return {
        // State
        isOpen,
        credits,
        isProcessing,
        conversation,
        activeSection,
        suggestions,

        // Actions
        openAssistant,
        closeAssistant,
        toggleAssistant,
        enhanceSection,
        applyTemplate,
        getSuggestions,
        addCredits,
        resetAssistant,

        // Utility
        hasSufficientCredits: (amount = 5) => credits >= amount
    };
};

// Helper functions
function enhanceContent(sectionId, currentData) {
    switch (sectionId) {
        case 'summary':
            if (typeof currentData === 'string') {
                return `${currentData}\n\n[AI Enhanced] - Professionally optimized with industry-specific keywords and improved readability. Added quantifiable achievements and action-oriented language to increase impact.`;
            }
            return currentData;

        case 'experience':
            if (Array.isArray(currentData)) {
                return currentData.map(exp => ({
                    ...exp,
                    description: exp.description
                        ? `${exp.description}\n\n• AI-Optimized: Enhanced with quantifiable metrics (increased efficiency by 30%, reduced costs by $50K, improved performance by 40%) and action verbs (led, implemented, optimized, delivered)`
                        : exp.description
                }));
            }
            return currentData;

        default:
            return currentData;
    }
}

function expandContent(sectionId, currentData) {
    if (typeof currentData === 'string') {
        return `${currentData}\n\n[AI Expanded] - Added more detail and context to provide a comprehensive overview. Included relevant industry terms and expanded on key responsibilities and achievements to create a more compelling narrative.`;
    }
    return currentData;
}

function summarizeContent(sectionId, currentData) {
    if (typeof currentData === 'string') {
        return `${currentData}\n\n[AI Summarized] - Condensed to essential points while maintaining impact. Removed redundant information and focused on key achievements and skills.`;
    }
    return currentData;
}

function addKeywords(sectionId, currentData) {
    if (typeof currentData === 'string') {
        return `${currentData}\n\n[AI Keywords Added] - Integrated relevant industry keywords: agile methodology, cross-functional collaboration, stakeholder management, strategic planning, data-driven decision making, continuous improvement.`;
    }
    return currentData;
}

function getSectionTemplate(sectionId, templateName) {
    const templates = {
        summary: {
            entryLevel: `Recent graduate with strong foundation in web development. Proficient in modern JavaScript frameworks and responsive design. Eager to contribute to innovative projects and grow within a collaborative team environment.`,
            experienced: `Seasoned software engineer with 5+ years of experience building scalable web applications. Proven track record in leading cross-functional teams and delivering high-quality code. Strong expertise in React, Node.js, and cloud technologies.`,
            careerChange: `Transitioning from project management to software development. Bringing strong analytical skills, leadership experience, and a passion for technology. Recently completed intensive coding bootcamp with focus on full-stack JavaScript development.`
        },
        experience: [
            {
                jobTitle: 'Senior Software Engineer',
                company: 'Tech Company Inc.',
                location: 'San Francisco, CA',
                startDate: '2020-01',
                endDate: 'Present',
                description: 'Led development of customer-facing web applications. Implemented microservices architecture. Mentored junior developers.'
            }
        ]
    };

    return templates[sectionId]?.[templateName] || null;
}

function generateSuggestions(sectionId, currentData) {
    const suggestions = [];

    switch (sectionId) {
        case 'summary':
            suggestions.push(
                'Add quantifiable achievements (e.g., "Increased conversion by 30%")',
                'Include relevant industry keywords',
                'Keep length between 3-5 sentences',
                'Focus on value you bring to employers'
            );
            break;

        case 'experience':
            suggestions.push(
                'Start bullet points with action verbs',
                'Include metrics and results',
                'Focus on achievements, not just responsibilities',
                'Use industry-standard terminology'
            );
            break;

        case 'skills':
            suggestions.push(
                'Group related skills together',
                'Order by proficiency level',
                'Include both technical and soft skills',
                'Tailor to job description keywords'
            );
            break;
    }

    return suggestions;
}

export default useAIAssistant;