import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@agents/(.*)$': '<rootDir>/src/agents/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@avatar/(.*)$': '<rootDir>/src/avatar/$1',
    '^@financial/(.*)$': '<rootDir>/src/financial/$1',
    '^@security/(.*)$': '<rootDir>/src/security/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.types.ts',
    '!src/**/*.interface.ts',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 60,
      functions: 50,
      branches: 40,
      statements: 60,
    },
  },
  verbose: true,
};

export default config;
