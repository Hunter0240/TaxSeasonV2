module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.test.js'],
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**/*.js'
  ],
  verbose: true,
  testTimeout: 30000,
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(retry-axios)/)'
  ]
};
