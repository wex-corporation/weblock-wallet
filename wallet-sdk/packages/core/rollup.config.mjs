import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationMap: true,
      outputToFilesystem: true,
    }),
    nodeResolve(),
    commonjs(),
  ],
  external: ['aes-js'],
};
