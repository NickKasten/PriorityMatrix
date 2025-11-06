import type { Config } from "@react-router/dev/config";

export default {
  // Static SPA build for GitHub Pages
  ssr: false,
  basename: process.env.VITE_APP_BASE_PATH || '/',
} satisfies Config;
