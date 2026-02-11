// vite.config.js - FIXED VERSION
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',

    define: {
      'process.env': env,
      'process.env.NODE_ENV': JSON.stringify(mode),
      '__DEV__': mode === 'development',
      '__PROD__': mode === 'production'
    },

    plugins: [
      react({
        jsxRuntime: 'automatic',
        devTarget: 'es2022',
        // Remove babel config, SWC handles it
      })
    ],

    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT) || 5173,
      host: 'localhost', // Changed from '0.0.0.0' to 'localhost' for stability
      open: true,
      strictPort: true,
      cors: true,
      compress: true,

      // ✅ FIXED: Simplified historyApiFallback for SPA
      historyApiFallback: {
        index: '/index.html',
        disableDotRule: true
      },

      // ✅ FIXED: Proxy configuration
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err) => {
              console.log('⚠️ Proxy error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log(`➡️ Proxying: ${req.method} ${req.url}`);
            });
          }
        },
        '/socket.io': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5001',
          ws: true,
          changeOrigin: true,
          secure: false
        }
      },

      // ✅ FIXED: HMR configuration
      hmr: {
        host: 'localhost',
        port: parseInt(env.VITE_DEV_SERVER_PORT) || 5173,
        protocol: 'ws',
        overlay: false
      },

      watch: {
        usePolling: false,
        interval: 100
      },

      // ✅ ADDED: Handle vite client properly
      middlewareMode: false,
    },

    preview: {
      port: 3001,
      host: true,
      historyApiFallback: true
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2020',
      cssTarget: 'chrome80',

      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Better chunking strategy
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('react-router')) {
                return 'vendor-router';
              }
              if (id.includes('lucide-react') || id.includes('framer-motion')) {
                return 'vendor-ui';
              }
              if (id.includes('axios') || id.includes('socket.io')) {
                return 'vendor-utils';
              }
              return 'vendor-other';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        },
        // Prevent missing dependencies
        preserveEntrySignatures: 'strict',
        external: []
      },

      // ✅ FIXED: Better build settings
      chunkSizeWarningLimit: 800,
      emptyOutDir: true,
      reportCompressedSize: true,
      assetsInlineLimit: 4096,
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@assets': path.resolve(__dirname, 'src/assets')
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },

    css: {
      devSourcemap: true,
      postcss: './postcss.config.js',
      modules: {
        localsConvention: 'camelCase'
      }
    },

    envPrefix: 'VITE_',

    // ✅ FIXED: Optimize deps - include problematic packages
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'react-hot-toast',
        'framer-motion',
        'lucide-react'
      ],
      exclude: [],
      force: false,
      esbuildOptions: {
        target: 'es2020',
        supported: {
          'top-level-await': true
        }
      }
    },

    esbuild: {
      logLevel: 'info',
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode)
      }
    },

    // ✅ ADDED: Clearer logging
    logLevel: 'info',

    // ✅ ADDED: Clear build cache on changes
    clearScreen: false
  };
}); 