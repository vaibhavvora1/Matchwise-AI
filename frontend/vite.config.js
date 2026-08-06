import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    target: "esnext",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "vendor-framer";
            if (id.includes("gsap")) return "vendor-gsap";
            if (id.includes("jspdf") || id.includes("html2canvas"))
              return "vendor-pdf";
            if (
              id.includes("react-dom") ||
              id.includes("/react/") ||
              id.includes("react-router")
            ) {
              return "vendor-react";
            }

            // Split remaining vendor code by top-level package name
            // instead of dumping everything into one "vendor-common" blob
            const match = id.match(
              /node_modules\/(\.pnpm\/)?(@[^/]+\/[^/]+|[^/]+)/,
            );
            const pkgName = match ? match[2].replace("@", "") : "misc";
            return `vendor-${pkgName}`;
          }
        },
      },
    },
  },
});
