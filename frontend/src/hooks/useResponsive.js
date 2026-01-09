// src/hooks/useResponsive.js
import { useState, useEffect, useCallback } from 'react';

export const useResponsive = (config = {}) => {
    const {
        breakpoints = {
            xs: 0,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            '2xl': 1536
        },
        defaultBreakpoint = 'lg'
    } = config;

    const [breakpoint, setBreakpoint] = useState(defaultBreakpoint);
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    // Get current breakpoint based on window width
    const getCurrentBreakpoint = useCallback((width) => {
        const sortedBreakpoints = Object.entries(breakpoints)
            .sort(([, a], [, b]) => b - a);

        for (const [bp, minWidth] of sortedBreakpoints) {
            if (width >= minWidth) {
                return bp;
            }
        }

        return 'xs';
    }, [breakpoints]);

    // Handle window resize
    const handleResize = useCallback(() => {
        const newSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        setWindowSize(newSize);

        const newBreakpoint = getCurrentBreakpoint(newSize.width);
        if (newBreakpoint !== breakpoint) {
            console.log('🔄 [useResponsive] Breakpoint changed:', newBreakpoint);
            setBreakpoint(newBreakpoint);
        }
    }, [breakpoint, getCurrentBreakpoint]);

    // Initialize and add event listener
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Set initial values
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);

        // Add orientation change listener for mobile
        window.addEventListener('orientationchange', handleResize);

        console.log('📱 [useResponsive] Initialized with breakpoint:', breakpoint);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, [handleResize]);

    // Check if current breakpoint matches
    const isBreakpoint = useCallback((targetBreakpoint) => {
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
        const currentIndex = breakpointOrder.indexOf(breakpoint);
        const targetIndex = breakpointOrder.indexOf(targetBreakpoint);

        if (targetIndex === -1) return false;

        return currentIndex >= targetIndex;
    }, [breakpoint]);

    // Check if screen is mobile (less than md)
    const isMobile = breakpoint === 'xs' || breakpoint === 'sm';

    // Check if screen is tablet (md)
    const isTablet = breakpoint === 'md';

    // Check if screen is desktop (lg and above)
    const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';

    // Get responsive class name
    const getResponsiveClass = useCallback((classes) => {
        if (!classes || typeof classes !== 'object') return '';

        return classes[breakpoint] || classes.default || '';
    }, [breakpoint]);

    // Responsive value based on breakpoint
    const responsiveValue = useCallback((values) => {
        if (!values || typeof values !== 'object') return null;

        // Return value for current breakpoint or fallback
        return values[breakpoint] || values.default || null;
    }, [breakpoint]);

    // Check if orientation is portrait
    const isPortrait = windowSize.height > windowSize.width;

    // Check if orientation is landscape
    const isLandscape = windowSize.width > windowSize.height;

    return {
        // State
        breakpoint,
        windowSize,

        // Device type checks
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        isLandscape,

        // Helper functions
        isBreakpoint,
        getResponsiveClass,
        responsiveValue,

        // Breakpoint specific booleans
        isXs: breakpoint === 'xs',
        isSm: breakpoint === 'sm',
        isMd: breakpoint === 'md',
        isLg: breakpoint === 'lg',
        isXl: breakpoint === 'xl',
        is2Xl: breakpoint === '2xl',

        // Convenience properties
        width: windowSize.width,
        height: windowSize.height,
        aspectRatio: windowSize.width / windowSize.height
    };
};

// Predefined breakpoint configurations
export const breakpointConfigs = {
    tailwind: {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
    },
    bootstrap: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        '2xl': 1400
    },
    material: {
        xs: 0,
        sm: 600,
        md: 905,
        lg: 1240,
        xl: 1440,
        '2xl': 1920
    }
};

export default useResponsive;