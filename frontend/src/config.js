// src/config.js
const config = {
  // Development API URL
  apiUrl: 'http://localhost:5000/api',

  // Production API URL (will be overridden by build process)
  isProduction: false,

  // Feature flags
  features: {
    offlineMode: true,
    aiEnhancement: true,
    qrGeneration: true,
  }
};

// Override with window config if available (set in index.html)
if (window.APP_CONFIG) {
  Object.assign(config, window.APP_CONFIG);
}

// For production build, you can set these via build scripts
// or use environment-specific config files

export default config;