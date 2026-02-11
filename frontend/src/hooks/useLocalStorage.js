// src/hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Clear all localStorage for this app
  const clearAll = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        // Clear only keys that start with our app prefix or all if no prefix
        const prefix = 'resumecraft_';
        for (let i = 0; i < window.localStorage.length; i++) {
          const storageKey = window.localStorage.key(i);
          if (storageKey.startsWith(prefix)) {
            window.localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [initialValue]);

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== e.oldValue) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key, initialValue]);

  // Sync with multiple components using same key
  const syncValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item);
        if (JSON.stringify(parsedItem) !== JSON.stringify(storedValue)) {
          setStoredValue(parsedItem);
        }
      }
    } catch (error) {
      console.error(`Error syncing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Get item with expiry support
  const getWithExpiry = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const itemStr = window.localStorage.getItem(key);
      if (!itemStr) {
        return initialValue;
      }

      const item = JSON.parse(itemStr);
      const now = new Date().getTime();

      // Check if item has expiry
      if (item.expiry && now > item.expiry) {
        // If the item is expired, delete it and return initialValue
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return item.value !== undefined ? item.value : item;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}" with expiry:`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // Set item with expiry (in milliseconds)
  const setWithExpiry = useCallback((value, ttl) => {
    try {
      const now = new Date().getTime();
      const item = {
        value,
        expiry: ttl ? now + ttl : null
      };

      setStoredValue(value);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(item));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}" with expiry:`, error);
    }
  }, [key]);

  // Check if item exists and is not expired
  const hasValidItem = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const itemStr = window.localStorage.getItem(key);
      if (!itemStr) {
        return false;
      }

      const item = JSON.parse(itemStr);
      if (item.expiry) {
        const now = new Date().getTime();
        return now <= item.expiry;
      }

      return true;
    } catch (error) {
      console.error(`Error checking localStorage key "${key}":`, error);
      return false;
    }
  }, [key]);

  // Get all keys with our prefix
  const getAllKeys = useCallback((prefix = 'resumecraft_') => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const storageKey = window.localStorage.key(i);
        if (storageKey.startsWith(prefix)) {
          keys.push(storageKey);
        }
      }
      return keys;
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }, []);

  // Get size of stored data in bytes
  const getStorageSize = useCallback(() => {
    if (typeof window === 'undefined') {
      return 0;
    }

    try {
      const data = window.localStorage.getItem(key);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      console.error(`Error getting storage size for key "${key}":`, error);
      return 0;
    }
  }, [key]);

  // Clear expired items
  const clearExpired = useCallback((prefix = 'resumecraft_') => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const now = new Date().getTime();
      for (let i = 0; i < window.localStorage.length; i++) {
        const storageKey = window.localStorage.key(i);
        if (storageKey.startsWith(prefix)) {
          const itemStr = window.localStorage.getItem(storageKey);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (item.expiry && now > item.expiry) {
              window.localStorage.removeItem(storageKey);
              // If this is our current key, reset state
              if (storageKey === key) {
                setStoredValue(initialValue);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error clearing expired localStorage items:', error);
    }
  }, [key, initialValue]);

  // Subscribe to changes (for complex state management)
  const subscribe = useCallback((callback) => {
    if (typeof window === 'undefined') {
      return () => { };
    }

    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          callback(newValue);
        } catch (error) {
          console.error(`Error in subscription callback for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return {
    storedValue,
    setValue,
    removeValue,
    clearAll,
    syncValue,
    getWithExpiry,
    setWithExpiry,
    hasValidItem,
    getAllKeys,
    getStorageSize,
    clearExpired,
    subscribe
  };
};

export default useLocalStorage;