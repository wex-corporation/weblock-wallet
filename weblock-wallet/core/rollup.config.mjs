import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

console.log('[DEBUG] Rollup Config Loaded')

export default {
  input: 'dist/index.js', // TypeScript 출력 파일 사용
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      entryFileNames: '[name].cjs.js'
    },
    {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      entryFileNames: '[name].esm.js'
    }
  ],
  plugins: [resolve(), commonjs(), terser()],
  external: [
    '@wefunding-dev/wallet-types',
    'firebase',
    'firebase/app',
    'firebase/auth',
    'axios',
    'ethers',
    'localforage'
  ]
}
