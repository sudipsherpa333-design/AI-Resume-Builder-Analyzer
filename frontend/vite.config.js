import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '')

  // Base configuration for proxy target
  const apiTarget = env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5001'

  return {
    plugins: [react()],

    // Base URL for the app
    base: './',

    // Server configuration
    server: {
      port: parseInt(env.VITE_PORT || '5174'),
      host: true, // Use 'true' to listen on all addresses
      open: false, // Set to false to prevent automatic browser opening
      strictPort: false,

      // Hot Module Replacement - simplified configuration
      hmr: {
        overlay: true,
      },

      // Proxy configuration for API calls - fixed rewrite
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'), // Keep /api if backend expects it
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      },

      // CORS
      cors: true,
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Dynamic chunk splitting
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react'
              }
              if (id.includes('antd') || id.includes('@ant-design')) {
                return 'vendor-antd'
              }
              if (id.includes('@reduxjs') || id.includes('zustand')) {
                return 'vendor-state'
              }
              return 'vendor-other'
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        },
      },
      chunkSizeWarningLimit: 1600,
      // Empty output directory before building
      emptyOutDir: true,
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@store': path.resolve(__dirname, './src/store'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@types': path.resolve(__dirname, './src/types'),
        '@config': path.resolve(__dirname, './src/config'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },

    // CSS configuration - updated for Tailwind and SCSS
    css: {
      devSourcemap: true,
      postcss: './postcss.config.js', // Add this if you have Tailwind
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@styles/variables.scss"; @import "@styles/mixins.scss";`,
        },
        less: {
          javascriptEnabled: true, // For Ant Design
          modifyVars: {
            // Customize Ant Design theme if needed
          },
        },
      },
    },

    // Environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      '__APP_VERSION__': JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      '__APP_NAME__': JSON.stringify(env.VITE_APP_NAME || 'AI Resume Builder'),
      '__API_URL__': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:5001/api'),
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'dayjs',
        'lodash',
        'antd',
        '@ant-design/icons',
      ],
      exclude: ['js-big-decimal'],
      force: false, // Set to true if having dependency issues
    },

    // Preview configuration
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT || '4173'),
      host: true,
      open: false,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      },
    },

    // Global imports - optional but helpful
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
  }
})