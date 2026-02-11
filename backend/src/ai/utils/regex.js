// Common regex patterns used across the AI module
export const REGEX = {
    // Detect numbers, percentages, or metrics in bullets
    metrics: /\d+%|\d+x|\d+\+|\$\d+|\d+\s?(years|yrs)/i,

    // Split text into words for keyword extraction
    words: /\b\w+\b/g,

    // Detect email addresses (optional for future personal info analysis)
    email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,

    // Detect URLs
    url: /https?:\/\/[^\s]+/i
};
