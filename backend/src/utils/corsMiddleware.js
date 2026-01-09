// src/utils/corsMiddleware.js
export const withCORS = (url, options = {}) => {
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Origin': window.location.origin,
        },
        mode: 'cors'
    });
};