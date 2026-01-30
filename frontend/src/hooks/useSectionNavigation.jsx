// hooks/useSectionNavigation.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook for managing section navigation in the builder
 * @param {Array} sections - Array of section definitions
 * @param {string} activeSection - Currently active section ID
 * @param {Function} setActiveSection - Function to set active section
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation utilities and state
 */
export const useSectionNavigation = (sections, activeSection, setActiveSection, options = {}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Default options
    const {
        validateBeforeNavigate = true,
        persistInUrl = true,
        urlParamName = 'section',
        allowSkip = false,
        onBeforeNavigate = null,
        onAfterNavigate = null
    } = options;

    // State
    const [navigationHistory, setNavigationHistory] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Filter visible sections
    const visibleSections = useMemo(() => {
        return sections.filter(section => section.visible !== false);
    }, [sections]);

    // Calculate current index
    useEffect(() => {
        const index = visibleSections.findIndex(s => s.id === activeSection);
        setCurrentIndex(index >= 0 ? index : 0);

        // Update navigation history
        setNavigationHistory(prev => {
            if (prev.length === 0 || prev[prev.length - 1] !== activeSection) {
                return [...prev, activeSection];
            }
            return prev;
        });
    }, [activeSection, visibleSections]);

    // Update navigation capabilities
    useEffect(() => {
        setCanGoBack(currentIndex > 0);
        setCanGoForward(currentIndex < visibleSections.length - 1);
    }, [currentIndex, visibleSections.length]);

    // Sync with URL
    useEffect(() => {
        if (!persistInUrl) return;

        const params = new URLSearchParams(location.search);
        const urlSection = params.get(urlParamName);

        if (urlSection && urlSection !== activeSection) {
            const isValidSection = visibleSections.some(s => s.id === urlSection);
            if (isValidSection) {
                setActiveSection(urlSection);
            }
        }
    }, [location.search, persistInUrl, urlParamName, visibleSections, activeSection, setActiveSection]);

    // Update URL when section changes
    useEffect(() => {
        if (!persistInUrl) return;

        const params = new URLSearchParams(location.search);
        const currentParam = params.get(urlParamName);

        if (currentParam !== activeSection) {
            params.set(urlParamName, activeSection);
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        }
    }, [activeSection, persistInUrl, urlParamName, location, navigate]);

    // Validate if navigation to a section is allowed
    const validateNavigation = useCallback((fromSection, toSection) => {
        if (!validateBeforeNavigate) return true;

        // Skip validation for optional sections
        const fromSectionData = visibleSections.find(s => s.id === fromSection);
        const toSectionData = visibleSections.find(s => s.id === toSection);

        if (!fromSectionData || !toSectionData) return true;

        // Check if skipping is allowed
        if (!allowSkip && toSectionData.required) {
            // Check if all previous required sections are completed
            const sectionIndex = visibleSections.findIndex(s => s.id === toSection);
            const previousSections = visibleSections.slice(0, sectionIndex);
            const incompleteRequired = previousSections.filter(s =>
                s.required && s.id !== toSection
            );

            if (incompleteRequired.length > 0) {
                return {
                    allowed: false,
                    reason: `Please complete ${incompleteRequired[0].label} first`,
                    incompleteSections: incompleteRequired.map(s => s.id)
                };
            }
        }

        return { allowed: true };
    }, [validateBeforeNavigate, allowSkip, visibleSections]);

    // Navigate to a specific section
    const goToSection = useCallback(async (sectionId) => {
        if (sectionId === activeSection || isNavigating) return;

        // Validate navigation
        const validation = validateNavigation(activeSection, sectionId);
        if (!validation.allowed) {
            console.warn(`Navigation blocked: ${validation.reason}`);
            return false;
        }

        setIsNavigating(true);

        try {
            // Call before navigation hook
            if (onBeforeNavigate) {
                const shouldContinue = await onBeforeNavigate(activeSection, sectionId);
                if (shouldContinue === false) {
                    setIsNavigating(false);
                    return false;
                }
            }

            // Update active section
            setActiveSection(sectionId);

            // Call after navigation hook
            if (onAfterNavigate) {
                setTimeout(() => {
                    onAfterNavigate(sectionId, activeSection);
                }, 0);
            }

            return true;
        } catch (error) {
            console.error('Navigation error:', error);
            return false;
        } finally {
            setIsNavigating(false);
        }
    }, [activeSection, isNavigating, validateNavigation, setActiveSection, onBeforeNavigate, onAfterNavigate]);

    // Navigate to next section
    const goToNext = useCallback(async () => {
        if (currentIndex >= visibleSections.length - 1) return false;

        const nextSection = visibleSections[currentIndex + 1];
        return await goToSection(nextSection.id);
    }, [currentIndex, visibleSections, goToSection]);

    // Navigate to previous section
    const goToPrev = useCallback(async () => {
        if (currentIndex <= 0) return false;

        const prevSection = visibleSections[currentIndex - 1];
        return await goToSection(prevSection.id);
    }, [currentIndex, visibleSections, goToSection]);

    // Navigate with direction
    const navigateToSection = useCallback(async (direction) => {
        if (direction === 'next') {
            return await goToNext();
        } else if (direction === 'prev') {
            return await goToPrev();
        }
        return false;
    }, [goToNext, goToPrev]);

    // Jump to a specific section by index
    const jumpToIndex = useCallback(async (index) => {
        if (index < 0 || index >= visibleSections.length) return false;

        const targetSection = visibleSections[index];
        return await goToSection(targetSection.id);
    }, [visibleSections, goToSection]);

    // Skip to a section (bypass validation)
    const skipToSection = useCallback(async (sectionId) => {
        const originalValidate = validateBeforeNavigate;
        // Temporarily disable validation
        const success = await goToSection(sectionId);
        return success;
    }, [goToSection, validateBeforeNavigate]);

    // Get section by ID
    const getSection = useCallback((sectionId) => {
        return visibleSections.find(s => s.id === sectionId);
    }, [visibleSections]);

    // Get neighboring sections
    const getNeighbors = useCallback(() => {
        return {
            previous: currentIndex > 0 ? visibleSections[currentIndex - 1] : null,
            current: visibleSections[currentIndex],
            next: currentIndex < visibleSections.length - 1 ? visibleSections[currentIndex + 1] : null
        };
    }, [currentIndex, visibleSections]);

    // Calculate progress percentage
    const getProgress = useCallback(() => {
        if (visibleSections.length === 0) return 0;
        return Math.round(((currentIndex + 1) / visibleSections.length) * 100);
    }, [currentIndex, visibleSections.length]);

    // Get section indices for navigation
    const getSectionIndices = useCallback(() => {
        return {
            current: currentIndex,
            total: visibleSections.length,
            isFirst: currentIndex === 0,
            isLast: currentIndex === visibleSections.length - 1
        };
    }, [currentIndex, visibleSections.length]);

    // Check if a section is accessible (not blocked by validation)
    const isSectionAccessible = useCallback((sectionId) => {
        if (!validateBeforeNavigate) return true;

        const validation = validateNavigation(activeSection, sectionId);
        return validation.allowed;
    }, [activeSection, validateBeforeNavigate, validateNavigation]);

    // Get accessible sections from current position
    const getAccessibleSections = useCallback(() => {
        return visibleSections.filter(section =>
            isSectionAccessible(section.id)
        );
    }, [visibleSections, isSectionAccessible]);

    // Go back in navigation history
    const goBackInHistory = useCallback(() => {
        if (navigationHistory.length <= 1) return false;

        const previousSection = navigationHistory[navigationHistory.length - 2];
        return goToSection(previousSection);
    }, [navigationHistory, goToSection]);

    // Clear navigation history
    const clearHistory = useCallback(() => {
        setNavigationHistory([activeSection]);
    }, [activeSection]);

    // Bulk navigation for initialization
    const initializeNavigation = useCallback((initialSectionId = null) => {
        const initialSection = initialSectionId ||
            (persistInUrl ? new URLSearchParams(location.search).get(urlParamName) : null) ||
            visibleSections[0]?.id;

        if (initialSection) {
            setActiveSection(initialSection);
            clearHistory();
        }
    }, [persistInUrl, location.search, urlParamName, visibleSections, setActiveSection, clearHistory]);

    // Keyboard navigation handler
    const handleKeyboardNavigation = useCallback((event, options = {}) => {
        const {
            allowArrowKeys = true,
            allowTab = false,
            allowEnter = false,
            disabled = false
        } = options;

        if (disabled || isNavigating) return;

        // Prevent default only for keys we handle
        let shouldPreventDefault = false;

        if (allowArrowKeys) {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                goToNext();
                shouldPreventDefault = true;
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                goToPrev();
                shouldPreventDefault = true;
            }
        }

        if (allowTab && event.key === 'Tab') {
            if (event.shiftKey) {
                goToPrev();
            } else {
                goToNext();
            }
            shouldPreventDefault = true;
        }

        if (allowEnter && event.key === 'Enter' && event.ctrlKey) {
            goToNext();
            shouldPreventDefault = true;
        }

        if (shouldPreventDefault) {
            event.preventDefault();
        }
    }, [goToNext, goToPrev, isNavigating]);

    // Get section trail (breadcrumbs)
    const getSectionTrail = useCallback(() => {
        return visibleSections.slice(0, currentIndex + 1).map(section => ({
            id: section.id,
            label: section.label,
            completed: navigationHistory.includes(section.id)
        }));
    }, [visibleSections, currentIndex, navigationHistory]);

    // Check if navigation is in progress
    const getNavigationStatus = useCallback(() => ({
        isNavigating,
        canGoBack,
        canGoForward,
        currentSection: visibleSections[currentIndex],
        progress: getProgress()
    }), [isNavigating, canGoBack, canGoForward, visibleSections, currentIndex, getProgress]);

    return {
        // State
        currentIndex,
        visibleSections,
        currentSection: visibleSections[currentIndex],
        isNavigating,

        // Navigation functions
        navigateToSection,
        goToSection,
        goToNext,
        goToPrev,
        jumpToIndex,
        skipToSection,
        goBackInHistory,

        // Validation and accessibility
        validateNavigation,
        isSectionAccessible,
        getAccessibleSections,

        // Progress and information
        getProgress,
        getSection,
        getNeighbors,
        getSectionIndices,
        getSectionTrail,

        // History management
        navigationHistory,
        clearHistory,

        // Initialization
        initializeNavigation,

        // Event handlers
        handleKeyboardNavigation,

        // Status
        getNavigationStatus,

        // Convenience properties
        canGoBack,
        canGoForward,
        isFirst: currentIndex === 0,
        isLast: currentIndex === visibleSections.length - 1,
        totalSections: visibleSections.length,

        // Debug info
        debug: () => ({
            activeSection,
            currentIndex,
            totalSections: visibleSections.length,
            navigationHistory,
            canGoBack,
            canGoForward,
            accessibleSections: getAccessibleSections().map(s => s.id),
            progress: getProgress()
        })
    };
};

// For backward compatibility, also export as default
export default useSectionNavigation;