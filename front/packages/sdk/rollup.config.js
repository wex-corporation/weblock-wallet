// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import polyfillNode from 'rollup-plugin-polyfill-node'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/esm/index.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/umd/index.js',
      format: 'umd',
      name: 'WeblockSDK',
      sourcemap: true,
      globals: {
        crypto: 'crypto',
        http: 'http',
        https: 'https',
        zlib: 'zlib',
        events: 'events',
        stream: 'Stream',
        url: 'url',
        punycode: 'punycode',
        buffer: 'buffer'
      }
    }
  ],
  plugins: [
    json(),
    resolve({
      preferBuiltins: false,
      browser: true
    }),
    commonjs(),
    polyfillNode(), // Node.js 폴리필 추가
    typescript({ tsconfig: './tsconfig.json' })
  ],
  onwarn: (warning, warn) => {
    if (
      warning.code === 'CIRCULAR_DEPENDENCY' &&
      /web3/.test(warning.message)
    ) {
      return
    }
    warn(warning)
  },
  external: [
    'crypto',
    'http',
    'https',
    'zlib',
    'events',
    'stream',
    'url',
    'punycode',
    'buffer'
  ]
}
