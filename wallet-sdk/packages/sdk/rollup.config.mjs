import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      strict: true,
      exports: 'named',
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
      strict: true,
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'WalletSDK',
      sourcemap: true,
      strict: true,
      globals: {
        util: 'util',
        stream: 'stream',
        path: 'path',
        http: 'http',
        https: 'https',
        url: 'url',
        fs: 'fs',
        assert: 'assert',
        tty: 'tty',
        os: 'os',
        zlib: 'zlib',
        events: 'events',
        crypto: 'crypto',
      },
    },
  ],
  plugins: [
    json(),
    resolve({
      preferBuiltins: false,
      browser: true,
      mainFields: ['browser', 'module', 'main'],
    }),
    commonjs({
      transformMixedEsModules: true,
      strictRequires: true,
    }),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    polyfillNode(),
    terser({
      format: {
        comments: false,
      },
      compress: {
        passes: 2,
      },
    }),
  ],
  external: [
    'util',
    'stream',
    'path',
    'http',
    'https',
    'url',
    'fs',
    'assert',
    'tty',
    'os',
    'zlib',
    'events',
    'crypto',
  ],
};
