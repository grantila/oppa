module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/lib/**/*.spec.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/lib/**/*.ts'],
  coverageReporters: ['lcov', 'text', 'html'],
};
