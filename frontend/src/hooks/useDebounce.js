// src/hooks/useDebounce.js - FIXED VERSION
import React, { useRef, useCallback, useEffect } from 'react';

export const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);

    // Update callback if it changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedCallback = useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
};