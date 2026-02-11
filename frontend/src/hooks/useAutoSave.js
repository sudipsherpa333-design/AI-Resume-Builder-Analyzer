// hooks/useAutoSave.js - AUTO-SAVE WITH BACKEND API INTEGRATION
import { useState, useEffect, useCallback, useRef } from 'react';

const useAutoSave = ({ data, onSave, delay = 2000, enabled = true, apiUrl = null }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const [saveCount, setSaveCount] = useState(0);

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const performSave = useCallback(async (dataToSave) => {
    if (!isMountedRef.current) return;

    try {
      setIsSaving(true);
      setSaveStatus('saving');

      // Call custom onSave handler
      if (onSaveRef.current) {
        const result = await onSaveRef.current(dataToSave);

        if (result !== false && isMountedRef.current) {
          setLastSaved(new Date());
          setSaveStatus('saved');
          setSaveCount(prev => prev + 1);

          // Reset status after 2 seconds
          setTimeout(() => {
            if (isMountedRef.current) {
              setSaveStatus('idle');
            }
          }, 2000);
        }
      }

      // Also call API if provided
      if (apiUrl) {
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
          throw new Error(`API save failed: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      if (isMountedRef.current) {
        setSaveStatus('error');

        // Reset error status after 3 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveStatus('idle');
          }
        }, 3000);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!enabled || !data || !onSaveRef.current) {
      return;
    }

    const dataChanged = JSON.stringify(data) !== JSON.stringify(prevDataRef.current);

    if (dataChanged) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          performSave(data);
          prevDataRef.current = JSON.parse(JSON.stringify(data));
        }
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, performSave]);

  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (data) {
      performSave(data);
      prevDataRef.current = JSON.parse(JSON.stringify(data));
    }
  }, [data, performSave]);

  return {
    isSaving,
    saveStatus,
    lastSaved,
    saveCount,
    forceSave
  };
};

export default useAutoSave;