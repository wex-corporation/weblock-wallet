import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

export default {
  input: 'dist/index.js',
  output: [
    {
      file: 'dist/cjs/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/esm/index.esm.js',
      format: 'esm',
      sourcemap: true
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
