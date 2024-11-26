const path = require('path')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@wefunding-dev/wallet-core$': path.resolve(__dirname, '../core/src'),
    '^@wefunding-dev/wallet-types$': path.resolve(__dirname, '../types/src')
  },
  modulePaths: ['<rootDir>/src']
}
