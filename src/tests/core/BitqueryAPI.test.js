const { BitqueryAPI } = require('../../core/api/BitqueryAPI');

describe('BitqueryAPI', () => {
  let api;
  const mockClientId = 'test-client-id';
  const mockClientSecret = 'test-client-secret';
  const mockAccessToken = 'test-access-token';
  
  beforeEach(() => {
    // Reset environment and mocks before each test
    process.env.BITQUERY_CLIENT_ID = mockClientId;
    process.env.BITQUERY_CLIENT_SECRET = mockClientSecret;
    jest.clearAllMocks();
  });

  describe('Constructor and Authentication', () => {
    test('should initialize with client credentials', () => {
      api = new BitqueryAPI(mockClientId, mockClientSecret);
      expect(api.clientId).toBe(mockClientId);
      expect(api.clientSecret).toBe(mockClientSecret);
      expect(api.accessToken).toBe('');
    });

    test('should authenticate successfully', async () => {
      const mockAuthResponse = {
        data: { access_token: mockAccessToken }
      };
      
      jest.spyOn(require('axios'), 'post').mockResolvedValueOnce(mockAuthResponse);
      
      api = new BitqueryAPI(mockClientId, mockClientSecret);
      await api.authenticate();
      
      expect(api.accessToken).toBe(mockAccessToken);
      expect(api.axiosInstance.defaults.headers['Authorization']).toBe(`Bearer ${mockAccessToken}`);
    });

    test('should handle authentication failure', async () => {
      jest.spyOn(require('axios'), 'post').mockRejectedValueOnce(new Error('Auth failed'));
      
      api = new BitqueryAPI(mockClientId, mockClientSecret);
      await expect(api.authenticate()).rejects.toThrow('Failed to authenticate with Bitquery API');
    });
  });

  describe('Query Execution', () => {
    const mockQuery = 'query { test }';
    const mockVariables = { var: 'test' };
    const mockSuccessResponse = {
      data: { test: 'success' }
    };

    beforeEach(() => {
      api = new BitqueryAPI(mockClientId, mockClientSecret);
      // Mock successful authentication
      jest.spyOn(api, 'authenticate').mockResolvedValue();
    });

    test('should execute successful query', async () => {
      jest.spyOn(api.axiosInstance, 'post').mockResolvedValueOnce({ data: mockSuccessResponse });
      
      const result = await api.query(mockQuery, mockVariables);
      expect(result).toEqual(mockSuccessResponse);
      expect(api.axiosInstance.post).toHaveBeenCalledWith(
        api.baseURL,
        {
          query: mockQuery,
          variables: mockVariables
        }
      );
    });

    test('should handle GraphQL errors in response', async () => {
      const mockErrorResponse = {
        data: {
          errors: [{ message: 'GraphQL Error' }]
        }
      };
      jest.spyOn(api.axiosInstance, 'post').mockResolvedValueOnce(mockErrorResponse);

      const result = await api.query(mockQuery);
      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('GraphQL Error');
    });

    test('should handle network errors', async () => {
      jest.spyOn(api.axiosInstance, 'post').mockRejectedValueOnce(new Error('Network Error'));

      const result = await api.query(mockQuery);
      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toBe('Network Error');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      api = new BitqueryAPI(mockClientId, mockClientSecret);
    });

    test('should handle API errors with response', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad Request' },
          headers: {}
        }
      };

      const result = api.handleError(error);
      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('API Error: 400');
    });

    test('should handle network errors without response', () => {
      const error = new Error('Network Error');

      const result = api.handleError(error);
      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toBe('Network Error');
      expect(result.errors[0].extensions.code).toBe('NETWORK_ERROR');
    });
  });
});