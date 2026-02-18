import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
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
    // Aggressive minification for production
    minify: "esbuild", // Use esbuild for faster, smaller bundles
    cssMinify: true,
    // Code splitting and chunk optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: (id) => {
          // Split node_modules into separate chunks
          if (id.includes("node_modules")) {
            // Firebase SDK (large library - split separately)
            if (id.includes("firebase")) {
              return "vendor-firebase";
            }
            // Chart libraries (admin only)
            if (id.includes("recharts") || id.includes("lucide-react")) {
              return "vendor-charts";
            }
            // PDF generation libraries (lazy loaded)
            if (id.includes("jspdf") || id.includes("html2canvas")) {
              return "vendor-pdf";
            }
            // Animation library (used selectively)
            if (id.includes("framer-motion")) {
              return "vendor-animations";
            }
            // Form libraries (common across pages)
            if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@hookform")) {
              return "vendor-forms";
            }
            // Radix UI components (large library - split by usage)
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }
            // React Query (used throughout)
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            // Everything else from node_modules
            return "vendor";
          }
        },
        // Optimize chunk file names
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || "")) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/woff2?|eot|ttf|otf/i.test(ext || "")) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[ext]/[name]-[hash][extname]";
        },
      },
    },
    // Chunk size warnings (help identify oversized bundles)
    chunkSizeWarningLimit: 1000,
    // Optimize asset inlining threshold
    assetsInlineLimit: 4096, // 4kb - inline smaller assets
    // Source maps for production (optional - disable for smaller bundles)
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: ["es2015", "edge88", "firefox78", "chrome87", "safari14"],
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
