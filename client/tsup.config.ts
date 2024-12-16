import { defineConfig } from 'tsup'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  platform: 'browser',
  esbuildPlugins: [
    polyfillNode({
      polyfills: {
        crypto: true,
        events: true,
        stream: true,
        buffer: true,
      },
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
  },
})
