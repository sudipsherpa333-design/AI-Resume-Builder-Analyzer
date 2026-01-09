// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin for bundle analysis
const bundleAnalyzer = (mode) => {
  if (mode === 'analyze') {
    return visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    });
  }
  return null;
};

export default defineConfig(({ mode }) => {
  // Load env files based on mode
  const env = loadEnv(mode, process.cwd(), '');

  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  const isAnalyze = mode === 'analyze';

  const backendUrl = env.VITE_API_URL || `http://localhost:5001`;
  const frontendPort = env.VITE_FRONTEND_PORT || 3000;
  const appName = env.VITE_APP_NAME || 'AI Resume Builder';

  console.log(`🚀 ${appName} - Mode: ${mode}`);
  console.log(`🌐 Backend: ${backendUrl}`);
  console.log(`💻 Frontend: http://localhost:${frontendPort}`);

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-transform-runtime', { regenerator: true }]
          ],
        },
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
      }),
      bundleAnalyzer(mode),
    ].filter(Boolean),

    base: isProduction ? '/' : '/',

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_NAME__: JSON.stringify(appName),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@admin': path.resolve(__dirname, 'src/admin'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@data': path.resolve(__dirname, 'src/data'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs'],
    },

    server: {
      port: parseInt(frontendPort),
      host: '0.0.0.0',
      strictPort: true,
      open: true,
      cors: true,
      hmr: {
        overlay: true,
        clientPort: parseInt(frontendPort),
      },
      fs: {
        strict: true,
        allow: ['..'],
      },

      // Smart proxy configuration
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => {
            // Remove /api prefix for backend routes that don't need it
            const backendPath = path.replace(/^\/api/, '');
            console.log(`🌐 Proxy: ${path} -> ${backendUrl}${backendPath}`);
            return backendPath;
          },
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.error('❌ Proxy Error:', err.message);
              if (res.writeHead) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Proxy connection failed. Please check if backend is running.');
              }
            });

            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (isDevelopment) {
                const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
                console.log(`➡️  [${timestamp}] ${req.method} ${req.url}`);
              }
            });

            proxy.on('proxyRes', (proxyRes, req, res) => {
              if (isDevelopment) {
                const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
                const status = proxyRes.statusCode;
                const statusColor = status >= 400 ? '31' : status >= 300 ? '33' : '32';
                console.log(`\x1b[${statusColor}m⬅️  [${timestamp}] ${req.method} ${req.url} ${status}\x1b[0m`);
              }
            });
          },
        },

        // Separate proxy for socket.io if needed
        '/socket.io': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },

      watch: {
        usePolling: false,
        interval: 100,
      },
    },

    preview: {
      port: 4173,
      host: true,
      cors: true,
      open: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: isProduction ? 'hidden' : true,
      minify: isProduction ? 'esbuild' : false,
      target: 'es2020',
      chunkSizeWarningLimit: 1024,
      cssCodeSplit: true,
      reportCompressedSize: true,
      assetsInlineLimit: 4096,
      emptyOutDir: true,

      // Improved asset naming
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor splitting for better caching
            if (id.includes('node_modules')) {
              // React and core
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              // UI libraries
              if (id.includes('@mui') || id.includes('antd') || id.includes('framer-motion')) {
                return 'vendor-ui';
              }
              // Charts and visualization
              if (id.includes('recharts') || id.includes('html2canvas') || id.includes('jspdf')) {
                return 'vendor-charts';
              }
              // State management and utilities
              if (id.includes('zustand') || id.includes('axios') || id.includes('date-fns')) {
                return 'vendor-utils';
              }
              // Icons
              if (id.includes('lucide-react') || id.includes('react-icons')) {
                return 'vendor-icons';
              }
              return 'vendor-other';
            }

            // Split admin and main app
            if (id.includes('/admin/')) {
              return 'admin';
            }
          },

          // Better file naming for cache busting
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg|webp)$/.test(name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            if (/\.css$/.test(name)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },

        external: [],
      },

      // Optimize dependencies
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react-router-dom',
        'axios',
        '@tanstack/react-query',
        'zustand',
        'framer-motion',
        'lucide-react',
        '@mui/material',
        '@mui/icons-material',
        'antd',
        'react-hot-toast',
        'date-fns',
        'html2canvas',
        'jspdf',
      ],
      exclude: [],
      esbuildOptions: {
        target: 'es2020',
        supported: {
          'top-level-await': true,
        },
      },
    },

    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: isProduction
          ? '[hash:base64:8]'
          : '[name]__[local]__[hash:base64:5]',
      },
      devSourcemap: isDevelopment,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@styles/variables.scss";`,
        },
      },
    },

    // Performance optimizations
    esbuild: {
      pure: isProduction ? ['console.log', 'console.debug'] : [],
      drop: isProduction ? ['debugger'] : [],
      legalComments: 'none',
    },
  };
});