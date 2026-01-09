// src/hooks/useUndoRedo.js
import { useState, useCallback, useEffect, useRef } from 'react';

export const useUndoRedo = (initialState, options = {}) => {
    const {
        maxHistorySize = 50,
        ignoreKeys = [],
        trackChanges = true,
        debounceDelay = 300
    } = options;

    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTracking, setIsTracking] = useState(true);

    const currentStateRef = useRef(initialState);
    const timeoutRef = useRef(null);
    const ignoreNextUpdateRef = useRef(false);

    // Get current state
    const getCurrentState = useCallback(() => {
        return history[currentIndex] || initialState;
    }, [history, currentIndex, initialState]);

    // Add new state to history
    const addToHistory = useCallback((newState, options = {}) => {
        const { skipIfSame = true, force = false } = options;

        if (!isTracking && !force) {
            console.log('⏸️ [useUndoRedo] Tracking paused, skipping history update');
            return;
        }

        // Check if state actually changed
        if (skipIfSame) {
            const current = getCurrentState();
            const hasChanged = !areStatesEqual(current, newState, ignoreKeys);

            if (!hasChanged) {
                console.log('⚡ [useUndoRedo] No changes detected, skipping');
                return;
            }
        }

        console.log('📝 [useUndoRedo] Adding to history, index:', currentIndex);

        // Remove future states if we're not at the end
        const newHistory = history.slice(0, currentIndex + 1);

        // Add new state
        newHistory.push(newState);

        // Limit history size
        if (newHistory.length > maxHistorySize) {
            newHistory.shift(); // Remove oldest
        }

        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
        currentStateRef.current = newState;

        console.log('✅ [useUndoRedo] History updated, new index:', newHistory.length - 1);
    }, [history, currentIndex, isTracking, maxHistorySize, ignoreKeys, getCurrentState]);

    // Debounced add to history
    const debouncedAddToHistory = useCallback((newState) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            addToHistory(newState);
        }, debounceDelay);
    }, [addToHistory, debounceDelay]);

    // Undo
    const undo = useCallback(() => {
        if (currentIndex <= 0) {
            console.log('⏹️ [useUndoRedo] Cannot undo: at beginning of history');
            return null;
        }

        const newIndex = currentIndex - 1;
        const previousState = history[newIndex];

        console.log('↩️ [useUndoRedo] Undoing to index:', newIndex);

        ignoreNextUpdateRef.current = true;
        setCurrentIndex(newIndex);
        currentStateRef.current = previousState;

        return previousState;
    }, [currentIndex, history]);

    // Redo
    const redo = useCallback(() => {
        if (currentIndex >= history.length - 1) {
            console.log('⏹️ [useUndoRedo] Cannot redo: at end of history');
            return null;
        }

        const newIndex = currentIndex + 1;
        const nextState = history[newIndex];

        console.log('↪️ [useUndoRedo] Redoing to index:', newIndex);

        ignoreNextUpdateRef.current = true;
        setCurrentIndex(newIndex);
        currentStateRef.current = nextState;

        return nextState;
    }, [currentIndex, history]);

    // Clear history
    const clearHistory = useCallback(() => {
        console.log('🧹 [useUndoRedo] Clearing history');
        setHistory([initialState]);
        setCurrentIndex(0);
        currentStateRef.current = initialState;
    }, [initialState]);

    // Pause tracking
    const pauseTracking = useCallback(() => {
        console.log('⏸️ [useUndoRedo] Pausing tracking');
        setIsTracking(false);
    }, []);

    // Resume tracking
    const resumeTracking = useCallback(() => {
        console.log('▶️ [useUndoRedo] Resuming tracking');
        setIsTracking(true);
    }, []);

    // Check if can undo/redo
    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    // Get history info
    const getHistoryInfo = useCallback(() => {
        return {
            currentIndex,
            historySize: history.length,
            maxSize: maxHistorySize,
            canUndo,
            canRedo,
            isTracking
        };
    }, [currentIndex, history.length, maxHistorySize, canUndo, canRedo, isTracking]);

    // Update when external state changes
    useEffect(() => {
        if (ignoreNextUpdateRef.current) {
            ignoreNextUpdateRef.current = false;
            return;
        }

        if (trackChanges && initialState && isTracking) {
            const current = getCurrentState();
            const hasChanged = !areStatesEqual(current, initialState, ignoreKeys);

            if (hasChanged) {
                console.log('🔄 [useUndoRedo] External state changed, adding to history');
                addToHistory(initialState);
            }
        }
    }, [initialState, trackChanges, isTracking, ignoreKeys, getCurrentState, addToHistory]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        // Current state
        currentState: getCurrentState(),
        currentIndex,

        // Actions
        undo,
        redo,
        addToHistory: debouncedAddToHistory,
        clearHistory,
        pauseTracking,
        resumeTracking,

        // State checks
        canUndo,
        canRedo,
        isTracking,

        // History info
        history,
        historyInfo: getHistoryInfo(),

        // Utility
        getCurrentState,
        reset: clearHistory
    };
};

// Helper function to compare states ignoring certain keys
function areStatesEqual(state1, state2, ignoreKeys = []) {
    if (state1 === state2) return true;
    if (!state1 || !state2) return false;

    const filtered1 = filterObject(state1, ignoreKeys);
    const filtered2 = filterObject(state2, ignoreKeys);

    return JSON.stringify(filtered1) === JSON.stringify(filtered2);
}

function filterObject(obj, ignoreKeys) {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => filterObject(item, ignoreKeys));
    }

    const filtered = {};
    Object.keys(obj).forEach(key => {
        if (!ignoreKeys.includes(key)) {
            filtered[key] = filterObject(obj[key], ignoreKeys);
        }
    });

    return filtered;
}

export default useUndoRedo;