const { ResponseParser } = require('../../../core/api/ResponseParser');

describe('ResponseParser', () => {
  describe('Response Parsing', () => {
    test('should parse successful response', () => {
      const response = {
        data: {
          user: { id: '1', name: 'Test' }
        }
      };

      const result = ResponseParser.parse(response);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(response.data);
      expect(result.errors).toBeUndefined();
    });

    test('should handle null response', () => {
      const result = ResponseParser.parse(null);
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors[0].message).toBe('No response received');
    });

    test('should handle GraphQL errors', () => {
      const response = {
        errors: [{
          message: 'Field not found',
          path: ['user', 'invalid'],
          locations: [{ line: 1, column: 1 }]
        }]
      };

      const result = ResponseParser.parse(response);
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors[0].message).toBe('Field not found');
    });
  });

  describe('Error Handling', () => {
    test('should format GraphQL errors', () => {
      const errors = [{
        message: 'Test error',
        path: ['test'],
        extensions: { code: 'TEST_ERROR' },
        locations: [{ line: 1, column: 1 }]
      }];

      const result = ResponseParser.handleErrors(errors);
      expect(result.success).toBe(false);
      expect(result.errors[0]).toMatchObject({
        message: 'Test error',
        path: ['test'],
        extensions: { code: 'TEST_ERROR' },
        locations: [{ line: 1, column: 1 }]
      });
    });

    test('should create error response', () => {
      const result = ResponseParser.createErrorResponse(
        'Test error',
        { code: 'TEST' }
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors[0]).toMatchObject({
        message: 'Test error',
        extensions: {
          code: 'PARSER_ERROR',
          code: 'TEST'
        }
      });
    });
  });

  describe('Field Extraction', () => {
    const response = {
      data: {
        user: {
          profile: {
            name: 'Test User',
            email: 'test@example.com'
          },
          settings: {
            theme: 'dark'
          }
        }
      }
    };

    test('should extract nested fields', () => {
      const fields = ResponseParser.extractFields(response, [
        'user.profile.name',
        'user.settings.theme'
      ]);

      expect(fields['user.profile.name']).toBe('Test User');
      expect(fields['user.settings.theme']).toBe('dark');
    });

    test('should handle missing fields', () => {
      const fields = ResponseParser.extractFields(response, [
        'user.profile.name',
        'user.profile.nonexistent'
      ]);

      expect(fields['user.profile.name']).toBe('Test User');
      expect(fields['user.profile.nonexistent']).toBeUndefined();
    });

    test('should handle null response data', () => {
      const fields = ResponseParser.extractFields({ data: null }, ['any.path']);
      expect(fields).toEqual({});
    });
  });

  describe('Schema Validation', () => {
    const response = {
      data: {
        user: {
          id: '1',
          name: 'Test',
          age: 25,
          profile: {
            bio: 'Test bio'
          }
        }
      }
    };

    test('should validate matching schema', () => {
      const schema = {
        user: {
          id: 'string',
          name: 'string',
          age: 'number',
          profile: {
            bio: 'string'
          }
        }
      };

      const isValid = ResponseParser.validateSchema(response, schema);
      expect(isValid).toBe(true);
    });

    test('should reject mismatched types', () => {
      const schema = {
        user: {
          id: 'number', // Should be string
          name: 'string'
        }
      };

      const isValid = ResponseParser.validateSchema(response, schema);
      expect(isValid).toBe(false);
    });

    test('should handle nested object validation', () => {
      const schema = {
        user: {
          profile: {
            bio: 'number' // Should be string
          }
        }
      };

      const isValid = ResponseParser.validateSchema(response, schema);
      expect(isValid).toBe(false);
    });

    test('should handle null response data', () => {
      const isValid = ResponseParser.validateSchema({ data: null }, {});
      expect(isValid).toBe(false);
    });
  });

  describe('Real World Examples', () => {
    test('should parse token price response', () => {
      const response = {
        data: {
          ethereum: {
            dexTrades: [{
              price: '1850.45',
              timestamp: '1629380400'
            }]
          }
        }
      };

      const result = ResponseParser.parse(response);
      expect(result.success).toBe(true);

      const fields = ResponseParser.extractFields(response, [
        'ethereum.dexTrades.0.price',
        'ethereum.dexTrades.0.timestamp'
      ]);

      expect(fields['ethereum.dexTrades.0.price']).toBe('1850.45');
    });

    test('should handle rate limit error', () => {
      const response = {
        errors: [{
          message: 'Rate limit exceeded',
          extensions: {
            code: 'RATE_LIMITED',
            retryAfter: '60'
          }
        }]
      };

      const result = ResponseParser.parse(response);
      expect(result.success).toBe(false);
      expect(result.errors[0].extensions.code).toBe('RATE_LIMITED');
    });
  });
}); 