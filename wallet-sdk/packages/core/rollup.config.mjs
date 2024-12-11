import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'iife',
      name: 'WalletCore',
      sourcemap: true,
      globals: {
        'firebase/app': 'firebase',
        'firebase/auth': 'firebase.auth',
        ethers: 'ethers',
      },
    },
  ],
  plugins: [
    json(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
  ],
  external: ['firebase/app', 'firebase/auth', 'ethers'],
};
