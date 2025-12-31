// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  // Backend API URL configuration
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:5001';
  const frontendPort = parseInt(env.VITE_PORT || '5174');
  const isDevelopment = mode === 'development';

  return {
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
        // Exclude specific files from Fast Refresh
        exclude: [/\.stories\.(t|j)sx?$/, /node_modules/],
        // Enable babel runtime automatic
        babel: {
          plugins: [
            ['@babel/plugin-transform-runtime', { regenerator: true }]
          ],
        },
      }),
    ],

    // Base public path for assets
    base: './',

    server: {
      port: frontendPort,
      host: true, // Listen on all network interfaces
      open: false, // Don't auto-open browser
      strictPort: true, // Fail if port is already in use
      cors: true, // Enable CORS for dev server

      // Proxy configuration for API requests
      proxy: {
        // API requests to backend
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request to:', req.url);
            });
          },
        },

        // Uploads and static files
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },

        // Health check endpoint
        '/health': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      },

      // Enable HMR (Hot Module Replacement)
      hmr: {
        overlay: true,
      },

      // Watch configuration
      watch: {
        usePolling: true,
        interval: 100,
      },
    },

    // Optimize dependencies for faster dev server startup
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'react-hot-toast',
        '@react-oauth/google',
        'lucide-react',
        'axios',
        'html2canvas',
        'jspdf',
        'zustand',
      ],
      exclude: [
        'html2pdf.js',
        'html2pdf',
      ],
      force: isDevelopment ? undefined : false,
      esbuildOptions: {
        target: 'es2020',
      },
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: !isDevelopment,
      cssMinify: !isDevelopment,

      // Rollup configuration
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          // Better chunking for performance
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('@mui') || id.includes('antd')) {
                return 'vendor-ui';
              }
              if (id.includes('framer-motion') || id.includes('lucide-react')) {
                return 'vendor-animations';
              }
              if (id.includes('html2canvas') || id.includes('jspdf')) {
                return 'vendor-pdf';
              }
              if (id.includes('axios') || id.includes('zustand')) {
                return 'vendor-utils';
              }
              return 'vendor';
            }
          },
          // File naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },

      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,

      // CommonJS options
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/node_modules/],
      },

      // Target browsers
      target: 'es2020',

      // Build assets
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
    },

    // Environment variables exposed to client
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_API_BASE_URL': JSON.stringify(apiTarget),
      'process.env.VITE_PORT': JSON.stringify(frontendPort),
      '__APP_VERSION__': JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      '__APP_NAME__': JSON.stringify(env.VITE_APP_NAME || 'AI Resume Builder'),
      '__DEV__': isDevelopment,
      '__PROD__': !isDevelopment,
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@context': path.resolve(__dirname, './src/context'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@types': path.resolve(__dirname, './src/types'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },

    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isDevelopment
          ? '[name]__[local]__[hash:base64:5]'
          : '[hash:base64:8]',
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },

    // Preview server configuration
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT || '4173'),
      host: true,
      open: false,
      cors: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Experimental features
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { runtime: `window.assetPath(${JSON.stringify(filename)})` };
        }
        return { relative: true };
      },
    },

    // Logging level
    logLevel: isDevelopment ? 'info' : 'warn',

    // Clear screen on restart
    clearScreen: false,
  };
});