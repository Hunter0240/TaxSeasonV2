require('dotenv').config();

// Add global test configuration
jest.setTimeout(30000); // Set timeout to 30 seconds for API calls

describe('Test Environment Setup', () => {
  test('environment variables are set', () => {
    expect(process.env.BITQUERY_CLIENT_ID).toBeDefined();
    expect(process.env.BITQUERY_CLIENT_SECRET).toBeDefined();
    expect(process.env.MAX_RETRIES).toBeDefined();
    expect(process.env.RETRY_DELAY).toBeDefined();
  });
});

// Optional: Add global test teardown
afterAll(async () => {
  // Add any cleanup if needed
}); 