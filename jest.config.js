const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    'src/lib/{rate-limit,schemas,security}.ts',
    '!src/components/dashboard/CategoryChart.tsx',
    '!src/components/auth/ReCaptchaToken.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};

module.exports = createJestConfig(customJestConfig);
