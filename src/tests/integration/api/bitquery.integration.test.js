const { BitqueryAPI } = require('../../../core/api/BitqueryAPI');
const { QueryBuilder } = require('../../../core/api/QueryBuilder');
const { ResponseParser } = require('../../../core/api/ResponseParser');
const axios = require('axios');

// Mock axios to prevent actual API calls
jest.mock('axios');

describe('Bitquery API Integration', () => {
  let api;
  const mockClientId = 'test-client-id';
  const mockClientSecret = 'test-client-secret';
  const mockAccessToken = 'test-access-token';

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful authentication
    axios.post.mockImplementation((url) => {
      if (url.includes('oauth2')) {
        return Promise.resolve({
          data: { access_token: mockAccessToken }
        });
      }
      return Promise.resolve({ data: {} });
    });

    api = new BitqueryAPI(mockClientId, mockClientSecret);
  });

  describe('End-to-End Query Flow', () => {
    test('should execute a complete query flow with authentication', async () => {
      // Mock successful GraphQL response
      const mockResponse = {
        data: {
          ethereum: {
            dexTrades: [{
              price: '1850.45',
              timestamp: '1629380400'
            }]
          }
        }
      };

      axios.post.mockImplementation((url) => {
        if (url.includes('oauth2')) {
          return Promise.resolve({
            data: { access_token: mockAccessToken }
          });
        }
        return Promise.resolve({ data: mockResponse });
      });

      // Build a query using QueryBuilder
      const builder = new QueryBuilder();
      const { query, variables } = builder
        .operation('query', 'GetTokenPrice', '$token: String!')
        .select('ethereum', [
          'dexTrades(options: { limit: 1 }, tokenAddress: $token) { price timestamp }'
        ])
        .setVariables({ token: '0x123' })
        .build();

      // Execute the query through BitqueryAPI
      const result = await api.query(query, variables);

      // Verify authentication was called
      expect(axios.post).toHaveBeenCalledWith(
        'https://oauth2.bitquery.io/oauth2/token',
        expect.any(URLSearchParams),
        expect.any(Object)
      );

      // Verify query was executed with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        'https://streaming.bitquery.io/graphql',
        {
          query,
          variables
        },
        expect.any(Object)
      );

      // Verify response was parsed correctly
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });

    test('should handle query errors through the entire stack', async () => {
      // Mock GraphQL error response
      const mockErrorResponse = {
        errors: [{
          message: 'Rate limit exceeded',
          extensions: {
            code: 'RATE_LIMITED',
            retryAfter: '60'
          }
        }]
      };

      axios.post.mockImplementation((url) => {
        if (url.includes('oauth2')) {
          return Promise.resolve({
            data: { access_token: mockAccessToken }
          });
        }
        return Promise.resolve({ data: mockErrorResponse });
      });

      // Execute a simple query
      const result = await api.executeQuery(
        'TestQuery',
        ['field1', 'field2'],
        { param: 'value' }
      );

      // Verify error was handled correctly
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Rate limit exceeded');
      expect(result.errors[0].extensions.code).toBe('RATE_LIMITED');
    });
  });

  describe('Complex Query Scenarios', () => {
    test('should handle nested queries with fragments', async () => {
      const mockResponse = {
        data: {
          ethereum: {
            address: {
              balances: [
                { token: { symbol: 'ETH' }, value: '1.5' },
                { token: { symbol: 'USDT' }, value: '1000' }
              ]
            }
          }
        }
      };

      axios.post.mockImplementation((url) => {
        if (url.includes('oauth2')) {
          return Promise.resolve({
            data: { access_token: mockAccessToken }
          });
        }
        return Promise.resolve({ data: mockResponse });
      });

      // Build complex query with fragments
      const builder = new QueryBuilder();
      const { query, variables } = builder
        .fragment('TokenFields', 'Token', ['symbol', 'name', 'decimals'])
        .fragment('BalanceFields', 'Balance', ['value', 'token { ...TokenFields }'])
        .operation('query', 'GetBalances', '$address: String!')
        .select('ethereum', [
          'address(address: $address) { balances { ...BalanceFields } }'
        ])
        .setVariables({ address: '0x123' })
        .build();

      const result = await api.query(query, variables);

      // Verify complex query handling
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);

      // Extract specific fields using ResponseParser
      const fields = ResponseParser.extractFields(mockResponse, [
        'ethereum.address.balances.0.token.symbol',
        'ethereum.address.balances.0.value'
      ]);

      expect(fields['ethereum.address.balances.0.token.symbol']).toBe('ETH');
      expect(fields['ethereum.address.balances.0.value']).toBe('1.5');
    });

    test('should validate response schema through the stack', async () => {
      const mockResponse = {
        data: {
          ethereum: {
            transaction: {
              hash: '0x123',
              value: '1.5',
              from: '0xabc',
              to: '0xdef'
            }
          }
        }
      };

      axios.post.mockImplementation((url) => {
        if (url.includes('oauth2')) {
          return Promise.resolve({
            data: { access_token: mockAccessToken }
          });
        }
        return Promise.resolve({ data: mockResponse });
      });

      const result = await api.executeQuery(
        'GetTransaction',
        ['hash', 'value', 'from', 'to'],
        { hash: '0x123' }
      );

      // Validate response schema
      const schema = {
        ethereum: {
          transaction: {
            hash: 'string',
            value: 'string',
            from: 'string',
            to: 'string'
          }
        }
      };

      const isValid = ResponseParser.validateSchema(mockResponse, schema);
      expect(isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle network errors', async () => {
      // Mock network error
      axios.post.mockImplementation((url) => {
        if (url.includes('oauth2')) {
          return Promise.resolve({
            data: { access_token: mockAccessToken }
          });
        }
        throw new Error('Network Error');
      });

      const result = await api.executeQuery(
        'TestQuery',
        ['field1'],
        { param: 'value' }
      );

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Network Error');
      expect(result.errors[0].extensions.code).toBe('NETWORK_ERROR');
    });

    test('should handle authentication failures', async () => {
      // Mock authentication failure
      axios.post.mockImplementation((url) => {
        if (url.includes('oauth2')) {
          return Promise.reject({
            response: {
              status: 401,
              data: { error: 'Invalid credentials' }
            }
          });
        }
        return Promise.resolve({ data: {} });
      });

      const result = await api.executeQuery(
        'TestQuery',
        ['field1']
      );

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Failed to authenticate with Bitquery API');
    });
  });
}); 