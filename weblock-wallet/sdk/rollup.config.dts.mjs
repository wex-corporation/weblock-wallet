import dts from 'rollup-plugin-dts'

export default {
  input: 'dist/esm/index.d.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'es'
  },
  plugins: [dts()],
  external: (id) => {
    // @wefunding-dev 스코프의 패키지와 node_modules의 패키지는 external로 처리
    return /^@wefunding-dev\//.test(id) || /^[a-z0-9@]/.test(id)
  }
}
