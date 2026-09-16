import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to import .wgsl files directly as raw shader strings
function wgslPlugin() {
  return {
    name: 'wgsl-loader',
    transform(code, id) {
      if (id.endsWith('.wgsl')) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: null,
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wgslPlugin()],
})
