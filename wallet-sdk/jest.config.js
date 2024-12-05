module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.base.json',
      },
    ],
  },
};
