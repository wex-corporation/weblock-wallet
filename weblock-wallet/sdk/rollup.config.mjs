import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import inject from '@rollup/plugin-inject'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'

export default {
  input: 'dist/esm/index.js',
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
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    inject({
      process: 'process',
      Buffer: ['buffer', 'Buffer']
    }),
    terser()
  ],
  external: (id) => {
    if (id === 'dist/esm/index.js') return false
    return /^@wefunding-dev\//.test(id) || /^[a-z0-9@]/.test(id)
  },
  onwarn: (warning, warn) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    if (warning.code === 'UNRESOLVED_IMPORT') return
    warn(warning)
  }
}
