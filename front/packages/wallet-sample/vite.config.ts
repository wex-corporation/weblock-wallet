import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    // Node.js polyfill 플러그인
    nodePolyfills({
      globals: {
        Buffer: true, // Buffer 전역 사용 허용
        global: true, // global 전역 사용 허용
        process: true // process 전역 사용 허용
      },
      protocolImports: true
    })
  ],
  server: {
    port: 3000 // Vite 서버 포트 설정
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify', // Node.js crypto 모듈을 브라우저에서 사용 가능하게 함
      stream: 'stream-browserify', // Node.js stream 모듈을 브라우저에서 사용 가능하게 함
      buffer: 'buffer', // Node.js buffer 모듈을 브라우저에서 사용 가능하게 함
      assert: 'assert', // Node.js assert 모듈을 브라우저에서 사용 가능하게 함
      // 기존에 @alwallet/sdk2를 wallet-sdk로 교체
      'wallet-sdk': path.resolve(__dirname, '../wallet-sdk/dist/index.js') // wallet-sdk 경로 지정
    }
  },
  optimizeDeps: {
    include: ['wallet-sdk'] // Vite가 wallet-sdk를 미리 번들에 포함하도록 설정
  }
})
