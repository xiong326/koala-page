import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Font fallback shards must stay as separate, on-demand files. Inlining
    // small shards would force every visitor to download the complete CJK font.
    assetsInlineLimit: 0,
  },
})
