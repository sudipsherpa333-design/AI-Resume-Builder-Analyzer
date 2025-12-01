import axios from 'axios';

// 1. Create the Axios instance with base configuration
const api = axios.create({
  // Use environment variable or fallback to localhost:5001 (backend port)
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 15000, // Increased timeout to 15 seconds for potentially slow operations
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 2. Request Interceptor: Automatically attach the JWT to outgoing requests.
 * This ensures that any API call made using 'api' is authenticated if a token exists.
 */
api.interceptors.request.use(
  (config) => {
    // We only retrieve the token here. The AuthProvider is responsible for setting it on initial load/login.
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request setup errors
    return Promise.reject(error);
  }
);

/**
 * 3. Response Interceptor: Handle global response errors, especially 401 Unauthorized.
 * If the token is invalid or expired, this forces a logout/redirect.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Check for 401 Unauthorized error
    if (status === 401) {
      console.error('Unauthorized (401): Token expired or invalid. Redirecting to login.');

      // Clear all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Perform a client-side hard redirect to the login page.
      // This is necessary because the AuthContext's state might not immediately update the router.
      window.location.href = '/login';

      // Reject the promise to stop further processing in the calling function
      return Promise.reject(error);
    }

    // For all other errors (400, 403, 500, etc.), just pass them through
    return Promise.reject(error);
  }
);

export default api;