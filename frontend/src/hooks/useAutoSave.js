// src/hooks/useAutoSave.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export const useAutoSave = (data, saveFn, interval = 30000, options = {}) => {
    const {
        enabled = true,
        minChanges = 1,
        showNotifications = true,
        onSaveSuccess = null,
        onSaveError = null,
        debounceDelay = 1000
    } = options;

    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'error' | 'success'
    const [lastSaved, setLastSaved] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [changeCount, setChangeCount] = useState(0);
    const [error, setError] = useState(null);

    const previousDataRef = useRef(data);
    const saveTimeoutRef = useRef(null);
    const intervalRef = useRef(null);
    const changeTrackerRef = useRef(0);

    // Track changes
    useEffect(() => {
        if (!data || !enabled) return;

        const hasDataChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);

        if (hasDataChanged) {
            console.log('📝 [useAutoSave] Detected changes');
            changeTrackerRef.current += 1;
            setHasChanges(true);
            setChangeCount(changeTrackerRef.current);

            // Update previous data reference
            previousDataRef.current = data;
        }
    }, [data, enabled]);

    // Auto-save when changes reach threshold
    useEffect(() => {
        if (!enabled || !hasChanges || changeCount < minChanges) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            performSave();
        }, debounceDelay);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [changeCount, enabled, hasChanges, minChanges, debounceDelay]);

    // Interval-based auto-save
    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            if (hasChanges) {
                console.log('⏰ [useAutoSave] Interval save triggered');
                performSave();
            }
        }, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, interval, hasChanges]);

    // Manual save function
    const manualSave = useCallback(async (force = false) => {
        if (!enabled && !force) {
            console.log('⏸️ [useAutoSave] Auto-save disabled');
            return false;
        }

        if (saveStatus === 'saving') {
            console.log('⏸️ [useAutoSave] Already saving, skipping');
            return false;
        }

        if (!hasChanges && !force) {
            console.log('⏸️ [useAutoSave] No changes to save');
            if (showNotifications) {
                toast('No changes to save', { icon: '📄' });
            }
            return true;
        }

        return performSave(force);
    }, [enabled, saveStatus, hasChanges, showNotifications]);

    // Perform the actual save
    const performSave = useCallback(async (force = false) => {
        if (!data && !force) {
            console.warn('⚠️ [useAutoSave] No data to save');
            return false;
        }

        console.log('💾 [useAutoSave] Saving data...', { force, hasChanges });
        setSaveStatus('saving');
        setError(null);

        try {
            const result = await saveFn(data);

            if (result) {
                setSaveStatus('success');
                setLastSaved(new Date());
                setHasChanges(false);
                changeTrackerRef.current = 0;
                setChangeCount(0);

                if (showNotifications) {
                    toast.success('Auto-saved successfully');
                }

                if (onSaveSuccess) {
                    onSaveSuccess(data, new Date());
                }

                console.log('✅ [useAutoSave] Save successful');
                return true;
            } else {
                throw new Error('Save function returned false');
            }
        } catch (err) {
            console.error('❌ [useAutoSave] Save failed:', err);
            setSaveStatus('error');
            setError(err.message || 'Save failed');

            if (showNotifications) {
                toast.error('Failed to auto-save');
            }

            if (onSaveError) {
                onSaveError(err, data);
            }

            return false;
        }
    }, [data, saveFn, showNotifications, onSaveSuccess, onSaveError, hasChanges]);

    // Start auto-save
    const startAutoSave = useCallback(() => {
        console.log('▶️ [useAutoSave] Starting auto-save');
        previousDataRef.current = data;
    }, [data]);

    // Stop auto-save
    const stopAutoSave = useCallback(() => {
        console.log('⏹️ [useAutoSave] Stopping auto-save');

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Reset auto-save state
    const reset = useCallback(() => {
        console.log('🔄 [useAutoSave] Resetting');
        setSaveStatus('idle');
        setHasChanges(false);
        setChangeCount(0);
        setError(null);
        changeTrackerRef.current = 0;
        previousDataRef.current = data;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
    }, [data]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log('🧹 [useAutoSave] Cleaning up');
            stopAutoSave();
        };
    }, [stopAutoSave]);

    return {
        // State
        saveStatus,
        lastSaved,
        hasChanges,
        changeCount,
        error,

        // Actions
        manualSave,
        startAutoSave,
        stopAutoSave,
        reset,

        // Utility
        isSaving: saveStatus === 'saving',
        isError: saveStatus === 'error',
        isSuccess: saveStatus === 'success',
        isIdle: saveStatus === 'idle'
    };
};

export default useAutoSave;