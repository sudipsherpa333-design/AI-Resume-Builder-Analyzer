// src/hooks/useSectionNavigation.js
import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Custom hook for managing section navigation in a multi-section form
 * @param {Array} sections - Array of section objects
 * @param {string} initialSection - Initial active section ID
 * @param {Object} options - Navigation options
 * @returns {Object} - Navigation controls and state
 */
export const useSectionNavigation = (sections = [], initialSection = '', options = {}) => {
    const {
        validateBeforeNavigate = true,
        onSectionChange = null,
        persistInUrl = false,
        urlParamName = 'section',
        allowSkip = false,
        completionRules = {}
    } = options;

    const [activeSection, setActiveSection] = useState(initialSection || (sections[0]?.id || ''));
    const [visitedSections, setVisitedSections] = useState(new Set());
    const [navigationHistory, setNavigationHistory] = useState([]);
    const [blockedSections, setBlockedSections] = useState(new Set());

    // Memoized derived state
    const visibleSections = useMemo(() =>
        sections.filter(s => s.visible !== false),
        [sections]
    );

    const sectionIds = useMemo(() =>
        visibleSections.map(s => s.id),
        [visibleSections]
    );

    const currentIndex = useMemo(() =>
        sectionIds.findIndex(id => id === activeSection),
        [sectionIds, activeSection]
    );

    const totalSections = useMemo(() => visibleSections.length, [visibleSections]);

    const currentSection = useMemo(() =>
        visibleSections.find(s => s.id === activeSection),
        [visibleSections, activeSection]
    );

    // Check if section is completed
    const isSectionCompleted = useCallback((sectionId, sectionData) => {
        const rules = completionRules[sectionId];
        if (!rules) return true; // No rules = always complete

        if (typeof rules === 'function') {
            return rules(sectionData);
        }

        if (Array.isArray(rules)) {
            return rules.every(rule => {
                if (rule.required && !sectionData?.[rule.field]) return false;
                if (rule.minLength && sectionData?.[rule.field]?.length < rule.minLength) return false;
                if (rule.pattern && !rule.pattern.test(sectionData?.[rule.field])) return false;
                return true;
            });
        }

        return true;
    }, [completionRules]);

    // Navigate to specific section
    const goToSection = useCallback((sectionId, data = null) => {
        if (!sectionIds.includes(sectionId)) {
            console.warn(`Section ${sectionId} not found`);
            return false;
        }

        // Validate current section before leaving
        if (validateBeforeNavigate && currentSection && data) {
            const isCurrentComplete = isSectionCompleted(activeSection, data);
            if (!isCurrentComplete && !allowSkip) {
                console.log(`Cannot leave ${activeSection} - incomplete`);
                return false;
            }
        }

        // Check if target section is blocked
        if (blockedSections.has(sectionId)) {
            console.log(`Section ${sectionId} is blocked`);
            return false;
        }

        const previousSection = activeSection;

        // Update state
        setActiveSection(sectionId);
        setVisitedSections(prev => new Set([...prev, previousSection, sectionId]));
        setNavigationHistory(prev => [...prev, { from: previousSection, to: sectionId, timestamp: Date.now() }]);

        // Persist in URL if enabled
        if (persistInUrl && typeof window !== 'undefined') {
            const url = new URL(window.location);
            url.searchParams.set(urlParamName, sectionId);
            window.history.replaceState({}, '', url);
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Callback
        if (onSectionChange) {
            onSectionChange({
                from: previousSection,
                to: sectionId,
                section: visibleSections.find(s => s.id === sectionId)
            });
        }

        console.log(`Navigated: ${previousSection} → ${sectionId}`);
        return true;
    }, [activeSection, sectionIds, currentSection, validateBeforeNavigate, allowSkip, blockedSections, persistInUrl, urlParamName, onSectionChange, visibleSections, isSectionCompleted]);

    // Navigate to next section
    const goToNext = useCallback((data = null) => {
        if (currentIndex < totalSections - 1) {
            const nextSectionId = sectionIds[currentIndex + 1];
            return goToSection(nextSectionId, data);
        }
        return false;
    }, [currentIndex, totalSections, sectionIds, goToSection]);

    // Navigate to previous section
    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            const prevSectionId = sectionIds[currentIndex - 1];
            return goToSection(prevSectionId);
        }
        return false;
    }, [currentIndex, sectionIds, goToSection]);

    // Navigate to first incomplete section
    const goToFirstIncomplete = useCallback((sectionsData = {}) => {
        for (const section of visibleSections) {
            if (!isSectionCompleted(section.id, sectionsData[section.id])) {
                return goToSection(section.id);
            }
        }
        return false;
    }, [visibleSections, isSectionCompleted, goToSection]);

    // Block/unblock sections
    const blockSection = useCallback((sectionId) => {
        setBlockedSections(prev => new Set([...prev, sectionId]));
    }, []);

    const unblockSection = useCallback((sectionId) => {
        setBlockedSections(prev => {
            const next = new Set(prev);
            next.delete(sectionId);
            return next;
        });
    }, []);

    // Get navigation progress
    const getProgress = useCallback(() => {
        const completedCount = visibleSections.filter(s =>
            visitedSections.has(s.id)
        ).length;

        return {
            current: currentIndex + 1,
            total: totalSections,
            percentage: Math.round(((currentIndex + 1) / totalSections) * 100),
            visited: visitedSections.size,
            completed: completedCount
        };
    }, [currentIndex, totalSections, visibleSections, visitedSections]);

    // Get section info
    const getSectionInfo = useCallback((sectionId) => {
        const section = visibleSections.find(s => s.id === sectionId);
        if (!section) return null;

        const index = sectionIds.indexOf(sectionId);
        const isVisited = visitedSections.has(sectionId);
        const isBlocked = blockedSections.has(sectionId);
        const isCurrent = sectionId === activeSection;

        return {
            ...section,
            index,
            isVisited,
            isBlocked,
            isCurrent,
            isFirst: index === 0,
            isLast: index === totalSections - 1,
            hasPrev: index > 0,
            hasNext: index < totalSections - 1
        };
    }, [visibleSections, sectionIds, visitedSections, blockedSections, activeSection, totalSections]);

    // Initialize from URL
    useEffect(() => {
        if (persistInUrl && typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const sectionFromUrl = urlParams.get(urlParamName);

            if (sectionFromUrl && sectionIds.includes(sectionFromUrl)) {
                setActiveSection(sectionFromUrl);
            }
        }
    }, [persistInUrl, urlParamName, sectionIds]);

    // Mark initial section as visited
    useEffect(() => {
        if (activeSection) {
            setVisitedSections(prev => new Set([...prev, activeSection]));
        }
    }, [activeSection]);

    return {
        // State
        activeSection,
        currentSection,
        currentIndex,
        totalSections,
        visibleSections,
        sectionIds,

        // Navigation actions
        goToSection,
        goToNext,
        goToPrev,
        goToFirstIncomplete,

        // Section management
        getSectionInfo,
        blockSection,
        unblockSection,
        isSectionCompleted,

        // Progress & info
        getProgress,
        visitedSections: Array.from(visitedSections),
        blockedSections: Array.from(blockedSections),
        navigationHistory,

        // Helper flags
        isFirstSection: currentIndex === 0,
        isLastSection: currentIndex === totalSections - 1,
        canGoNext: currentIndex < totalSections - 1,
        canGoPrev: currentIndex > 0
    };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (onNext, onPrev, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            // Ignore if user is typing in an input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }

            switch (e.key) {
                case 'ArrowRight':
                case 'PageDown':
                    e.preventDefault();
                    onNext?.();
                    break;

                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    onPrev?.();
                    break;

                case 'Home':
                    e.preventDefault();
                    // Optional: Add go to first
                    break;

                case 'End':
                    e.preventDefault();
                    // Optional: Add go to last
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNext, onPrev, enabled]);
};