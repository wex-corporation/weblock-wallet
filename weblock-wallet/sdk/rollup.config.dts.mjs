import dts from 'rollup-plugin-dts'

export default {
  input: 'dist/esm/index.d.ts', // TypeScript로 생성된 .d.ts 파일
  output: [
    {
      file: 'dist/index.d.ts', // 번들링된 타입 선언 파일 출력
      format: 'es'
    }
  ],
  plugins: [dts()]
}
