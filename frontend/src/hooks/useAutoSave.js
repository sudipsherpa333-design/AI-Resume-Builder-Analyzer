// hooks/useAutoSave.js - MINIMAL WORKING VERSION
import { useState, useEffect, useCallback, useRef } from 'react';

const useAutoSave = ({ data, onSave, delay = 5000, enabled = true }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const timeoutRef = useRef(null);
    const prevDataRef = useRef(null);
    const isMountedRef = useRef(true);
    const onSaveRef = useRef(onSave);

    useEffect(() => {
        onSaveRef.current = onSave;
    }, [onSave]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (!enabled || !data || !onSaveRef.current) return;

        const dataChanged = JSON.stringify(data) !== JSON.stringify(prevDataRef.current);

        if (dataChanged) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(async () => {
                if (!isMountedRef.current || !onSaveRef.current) return;

                try {
                    setIsSaving(true);
                    const result = await onSaveRef.current(data);
                    if (result !== false && isMountedRef.current) {
                        setLastSaved(new Date());
                    }
                } catch (error) {
                    console.error('Auto-save error:', error);
                } finally {
                    if (isMountedRef.current) {
                        setIsSaving(false);
                    }
                }
            }, delay);
        }

        prevDataRef.current = data;

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [data, enabled, delay]);

    return {
        isSaving,
        lastSaved
    };
};

export default useAutoSave;