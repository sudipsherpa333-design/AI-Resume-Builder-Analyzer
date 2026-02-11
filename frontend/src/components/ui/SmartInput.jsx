// src/components/ui/SmartInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// We'll import icons directly to avoid issues
import {
  Check, AlertCircle, HelpCircle, Sparkles,
  Loader2, Copy, RotateCcw, Wand2
} from 'lucide-react';

const SmartInput = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  helpText = '',
  className = '',
  icon: Icon,
  onIconClick,
  validate = null,
  suggestions = [],
  onSuggestionSelect,
  maxLength,
  minLength,
  pattern,
  autoFocus = false,
  rows = 3,
  debounceTime = 300,
  aiEnhanceable = false,
  onAIEnhance,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Sync with external value
  useEffect(() => {
    setInternalValue(value || '');
    setCharacterCount(value?.length || 0);
  }, [value]);

  // Validate input
  useEffect(() => {
    if (validate) {
      const validation = validate(internalValue);
      setIsValid(validation.isValid);
      setValidationError(validation.error || '');
    } else {
      if (required && !internalValue.trim()) {
        setIsValid(false);
        setValidationError('This field is required');
      } else if (pattern && internalValue && !new RegExp(pattern).test(internalValue)) {
        setIsValid(false);
        setValidationError('Invalid format');
      } else if (minLength && internalValue.length < minLength) {
        setIsValid(false);
        setValidationError(`Minimum ${minLength} characters`);
      } else {
        setIsValid(true);
        setValidationError('');
      }
    }
  }, [internalValue, required, pattern, minLength, validate]);

  // Handle change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setCharacterCount(newValue.length);

    if (debounceTime > 0) {
      if (inputRef.current.debounceTimer) {
        clearTimeout(inputRef.current.debounceTimer);
      }
      inputRef.current.debounceTimer = setTimeout(() => {
        onChange(newValue);
      }, debounceTime);
    } else {
      onChange(newValue);
    }
  };

  // Handle AI enhancement
  const handleAIEnhance = async () => {
    if (!onAIEnhance || isEnhancing) {
      return;
    }

    setIsEnhancing(true);
    try {
      const enhancedValue = await onAIEnhance(internalValue);
      if (enhancedValue) {
        setInternalValue(enhancedValue);
        onChange(enhancedValue);
        toast.success('Enhanced with AI!');
      }
    } catch (error) {
      toast.error('Failed to enhance with AI');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(internalValue);
    toast.success('Copied to clipboard!');
  };

  // Reset to original
  const handleReset = () => {
    setInternalValue('');
    onChange('');
    toast.info('Field reset');
  };

  // Click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isTextArea = type === 'textarea';
  const hasError = error || validationError;
  const currentError = error || validationError;

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {maxLength && (
            <span className={`text-xs ${characterCount > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Input/Textarea */}
        {isTextArea ? (
          <textarea
            ref={inputRef}
            value={internalValue}
            onChange={handleChange}
            onFocus={() => {
              setIsFocused(true);
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            className={`
                            w-full px-4 py-3 rounded-xl border-2 bg-white
                            transition-all duration-200 resize-none
                            ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }
                            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                            ${Icon ? 'pl-12' : ''}
                        `}
            autoFocus={autoFocus}
            {...props}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={internalValue}
            onChange={handleChange}
            onFocus={() => {
              setIsFocused(true);
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={`
                            w-full px-4 py-3 rounded-xl border-2 bg-white
                            transition-all duration-200
                            ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }
                            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                            ${Icon ? 'pl-12' : ''}
                        `}
            autoFocus={autoFocus}
            {...props}
          />
        )}

        {/* Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Icon
              size={20}
              className={`${hasError ? 'text-red-400' : 'text-gray-400'}`}
              onClick={onIconClick}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* AI Enhance Button */}
          {aiEnhanceable && onAIEnhance && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAIEnhance}
              disabled={disabled || isEnhancing || !internalValue.trim()}
              className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enhance with AI"
            >
              {isEnhancing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
            </motion.button>
          )}

          {/* Copy Button */}
          {internalValue && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </motion.button>
          )}

          {/* Reset Button */}
          {internalValue && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
              title="Reset field"
            >
              <RotateCcw size={16} />
            </motion.button>
          )}

          {/* Validation Indicator */}
          {isFocused && internalValue && (
            <div className="w-6 h-6 flex items-center justify-center">
              {isValid ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <AlertCircle size={16} className="text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {currentError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-sm text-red-600"
          >
            <AlertCircle size={14} />
            <span>{currentError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      {helpText && !currentError && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <HelpCircle size={14} />
          <span>{helpText}</span>
        </div>
      )}

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (onSuggestionSelect) {
                      onSuggestionSelect(suggestion);
                    } else {
                      setInternalValue(suggestion);
                      onChange(suggestion);
                    }
                    setShowSuggestions(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="text-sm text-gray-700">{suggestion}</div>
                  <div className="text-xs text-gray-400 mt-1">
                                        Click to select
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add both named and default export
export { SmartInput };
export default SmartInput;