import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react({
      // Re-enabled Fast Refresh with better configuration
      fastRefresh: true,
    }),
    // Bundle analyzer - run `npm run build` then open dist/stats.html
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Enhanced code splitting and optimization
    rollupOptions: {
      output: {
        // NO MANUAL CHUNKING - Let Vite handle it automatically
        // Manual chunking was causing circular dependencies where vendor loaded before react
        // Vite's automatic chunking ensures proper dependency order
        manualChunks: undefined,
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(png|jpe?g|gif|svg|webp|ico)$/)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(woff|woff2|ttf|eot|otf)$/)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Increase chunk size warning limit (for better optimization)
    chunkSizeWarningLimit: 1000,
    // Enable source maps in production (optional, can disable for smaller builds)
    sourcemap: false,
    // Optimize asset inlining
    assetsInlineLimit: 4096, // 4kb - inline smaller assets as base64
    // Additional optimizations
    cssCodeSplit: true, // Split CSS into separate files
    reportCompressedSize: true, // Report compressed sizes
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
      },
      format: {
        comments: false, // Remove comments
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // CRITICAL: Enable HMR - Vite automatically handles cache-busting with timestamps
    // Replit recommendation: Vite HMR automatically adds ?t=timestamp query params to bust cache
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5000,
      clientPort: 5000,
      overlay: true,
    },
    watch: {
      // Aggressively ignore files to prevent constant reloads
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/*.log', '**/logs/**', '**/.cursor/**', '**/website_projects/**', '**/attached_assets/**'],
      usePolling: false, // Use native file events (not polling)
    },
  },
});
