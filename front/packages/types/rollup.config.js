// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/esm/index.mjs',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/umd/index.js',
      format: 'umd',
      name: 'WeblockTypes',
      sourcemap: true
    }
  ],
  plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })]
}
