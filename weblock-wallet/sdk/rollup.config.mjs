import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import inject from '@rollup/plugin-inject'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'

console.log('[DEBUG] Rollup Config Loaded')

export default {
  input: 'dist/esm/index.js', // TypeScript 컴파일 후 생성된 ESM 파일
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
    resolve(),
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
  // 외부 의존성 처리
  external: (id) => {
    const isExternal = /^@wefunding-dev\//.test(id) || /^[a-z0-9@]/i.test(id)
    const isInputFile = id === 'dist/esm/index.js'
    console.log(
      `[DEBUG] External check: ${id} -> ${isExternal && !isInputFile}`
    )
    return isExternal && !isInputFile // input 파일은 external로 처리하지 않음
  },
  // 경고 처리
  onwarn(warning, warn) {
    if (warning.code === 'UNRESOLVED_IMPORT') return // 미해결 import 경고 무시
    warn(warning) // 기타 경고 출력
  }
}
