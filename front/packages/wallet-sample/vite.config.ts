import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true
    })
  ],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      assert: 'assert',
      '@alwallet/sdk2': path.resolve(__dirname, '../sdk2/dist/index.js')
    }
  },
  optimizeDeps: {
    include: ['@alwallet/sdk2']
  }
})
