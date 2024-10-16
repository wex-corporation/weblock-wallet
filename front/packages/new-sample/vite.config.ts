// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,   // Buffer를 폴리필로 제공합니다.
        global: true,   // Node.js의 global 객체를 브라우저에서 사용 가능하게 합니다.
        process: true,  // process 객체를 제공합니다.
      },
      protocolImports: true, // node: 프로토콜로 불러오는 모듈들을 지원합니다.
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      // Node.js 기본 모듈 폴리필
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      assert: 'assert',
    },
  },
});
