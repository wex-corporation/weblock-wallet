import dts from 'rollup-plugin-dts'

export default {
  input: 'src/index.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [
    dts({
      respectExternal: true,
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@wefunding-dev/wallet-types': ['../types/dist']
        }
      }
    })
  ],
  external: [
    '@wefunding-dev/wallet-types', // Ensure this is treated as external
    'firebase',
    'firebase/app',
    'firebase/auth'
  ]
}
