// Simple in-memory cache for job description keywords
// Optional: can later replace with Redis or DB cache

const jdCache = new Map();

/**
 * Save extracted keywords for a JD
 * @param {string} jdText
 * @param {Array<string>} keywords
 */
export const setCache = (jdText, keywords) => {
    const key = jdText.trim().slice(0, 100); // first 100 chars as key
    jdCache.set(key, keywords);
};

/**
 * Get cached keywords for a JD
 * @param {string} jdText
 * @returns {Array<string> | null}
 */
export const getCache = (jdText) => {
    const key = jdText.trim().slice(0, 100);
    return jdCache.get(key) || null;
};

/**
 * Clear the cache
 */
export const clearCache = () => jdCache.clear();
