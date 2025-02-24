class ResponseParser {
  /**
   * Parse and validate a GraphQL response
   * @param {Object} response - The raw GraphQL response
   * @returns {Object} - Parsed and validated response
   */
  static parse(response) {
    if (!response) {
      return this.createErrorResponse('No response received');
    }

    // Handle network or system errors
    if (response.errors && !response.data) {
      return this.handleErrors(response.errors);
    }

    // Handle successful response with possible GraphQL errors
    return {
      data: response.data,
      errors: response.errors,
      success: !response.errors
    };
  }

  /**
   * Handle GraphQL errors
   * @param {Array} errors - Array of GraphQL errors
   * @returns {Object} - Formatted error response
   */
  static handleErrors(errors) {
    const formattedErrors = errors.map(error => ({
      message: error.message,
      path: error.path,
      extensions: error.extensions,
      locations: error.locations
    }));

    return {
      data: null,
      errors: formattedErrors,
      success: false
    };
  }

  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {Object} [extensions] - Additional error details
   * @returns {Object} - Formatted error response
   */
  static createErrorResponse(message, extensions = {}) {
    return {
      data: null,
      errors: [{
        message,
        extensions: {
          code: 'PARSER_ERROR',
          ...extensions
        }
      }],
      success: false
    };
  }

  /**
   * Extract specific fields from the response
   * @param {Object} response - The parsed response
   * @param {string[]} paths - Array of dot-notation paths to extract
   * @returns {Object} - Object containing extracted values
   */
  static extractFields(response, paths) {
    if (!response.data) {
      return {};
    }

    const result = {};
    paths.forEach(path => {
      const value = this.getNestedValue(response.data, path);
      if (value !== undefined) {
        result[path] = value;
      }
    });

    return result;
  }

  /**
   * Get a nested value from an object using dot notation
   * @param {Object} obj - The object to traverse
   * @param {string} path - Dot-notation path
   * @returns {*} - The value at the path or undefined
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Validate response against expected schema
   * @param {Object} response - The parsed response
   * @param {Object} schema - Expected schema shape
   * @returns {boolean} - Whether the response matches the schema
   */
  static validateSchema(response, schema) {
    if (!response.data) {
      return false;
    }

    try {
      this.validateObject(response.data, schema);
      return true;
    } catch (error) {
      console.warn('Schema validation failed:', error.message);
      return false;
    }
  }

  /**
   * Validate an object against a schema
   * @param {Object} obj - Object to validate
   * @param {Object} schema - Schema to validate against
   * @throws {Error} - If validation fails
   */
  static validateObject(obj, schema) {
    Object.entries(schema).forEach(([key, expectedType]) => {
      if (typeof expectedType === 'object') {
        if (!obj[key] || typeof obj[key] !== 'object') {
          throw new Error(`Expected object for key ${key}`);
        }
        this.validateObject(obj[key], expectedType);
      } else {
        if (typeof obj[key] !== expectedType) {
          throw new Error(`Expected ${expectedType} for key ${key}, got ${typeof obj[key]}`);
        }
      }
    });
  }
}

module.exports = { ResponseParser }; 