import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

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
    }
  ],
  plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })],
  external: (id) =>
    id !== 'src/index.ts' && // 엔트리 파일을 외부 모듈로 간주하지 않음
    (/^@wefunding-dev\//.test(id) || /^[a-z0-9@]/i.test(id)), // 외부 의존성 처리
  onwarn(warning, warn) {
    if (warning.code === 'UNRESOLVED_IMPORT') return // 무시할 경고
    warn(warning)
  }
}
