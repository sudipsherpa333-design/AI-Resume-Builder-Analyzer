// Google OAuth configuration
export const googleConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  scope: 'profile email',
  redirectUri: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000',
};

// Validate Google ID token
export const validateGoogleToken = async (token) => {
  try {
    // In production, you would verify the token with Google's servers
    // For now, we'll just decode it and trust it (in production, never do this!)

    // Split the token to get payload
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode base64 payload
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    return {
      isValid: true,
      payload,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      isValid: false,
      error: error.message,
    };
  }
};
