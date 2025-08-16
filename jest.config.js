// jest.config.js
export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  moduleNameMapper: {
    '^#config/(.*)$': '<rootDir>/src/config/$1',
    '^#lib/(.*)$': '<rootDir>/src/lib/$1',
    '^#middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^#api/(.*)$': '<rootDir>/src/api/$1',
    '^#services/(.*)$': '<rootDir>/src/services/$1',
    '^#shared/(.*)$': '<rootDir>/src/shared/$1',
    '^#models/(.*)$': '<rootDir>/src/models/$1',
    '^#repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^#jobs/(.*)$': '<rootDir>/src/jobs/$1',
    '^#templates/(.*)$': '<rootDir>/src/templates/$1',
    '^#docs/(.*)$': '<rootDir>/src/docs/$1',
    '^#routes/(.*)$': '<rootDir>/src/routes/$1',
    '^#server/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@babel|@jest|jest-runtime|swagger-ui-dist)'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};