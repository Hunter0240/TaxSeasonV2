const axios = require('axios');
const rax = require('retry-axios');
const { QueryBuilder } = require('./QueryBuilder');
const { ResponseParser } = require('./ResponseParser');

class BitqueryAPI {
  constructor(clientId, clientSecret) {
    this.baseURL = 'https://streaming.bitquery.io/graphql';
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = '';
    
    // Configure retry policy and default headers for GraphQL requests
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json'
      }
    });
    rax.attach(this.axiosInstance);
    this.axiosInstance.defaults.raxConfig = {
      retry: parseInt(process.env.MAX_RETRIES || '3'),
      backoffType: 'static',
      delay: parseInt(process.env.RETRY_DELAY || '1000'),
      statusCodesToRetry: [[408, 429, 500, 502, 503, 504]]
    };
  }

  /**
   * Authenticate with the Bitquery API
   * @returns {Promise<void>}
   */
  async authenticate() {
    if (!this.accessToken) {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('scope', 'api');

      try {
        const authResponse = await axios.post(
          'https://oauth2.bitquery.io/oauth2/token',
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        this.accessToken = authResponse.data.access_token;
        this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${this.accessToken}`;
      } catch (error) {
        console.error('Authentication error:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Bitquery API');
      }
    }
  }

  /**
   * Execute a GraphQL query
   * @param {string} queryName - Name of the query
   * @param {string[]} fields - Fields to select
   * @param {Object} variables - Query variables
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Query response
   */
  async executeQuery(queryName, fields, variables = {}, options = {}) {
    try {
      await this.authenticate();
      
      const { query, variables: queryVars } = QueryBuilder.createQuery(
        queryName,
        fields,
        variables,
        options
      );

      console.log('Executing GraphQL query:', {
        query,
        variables: queryVars
      });
      
      const response = await this.axiosInstance.post(
        this.baseURL,
        {
          query,
          variables: queryVars
        }
      );

      return ResponseParser.parse(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Execute a custom GraphQL query
   * @param {string} query - Raw GraphQL query
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>} - Query response
   */
  async query(query, variables = {}) {
    try {
      await this.authenticate();
      
      console.log('Executing raw GraphQL query:', {
        query,
        variables
      });
      
      const response = await this.axiosInstance.post(
        this.baseURL,
        {
          query,
          variables
        }
      );

      return ResponseParser.parse(response.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Object} - Formatted error response
   */
  handleError(error) {
    if (error.response) {
      console.error('API Error Details:', {
        status: error.response.status,
        data: error.response.data,
        errors: error.response.data.errors,
        headers: error.response.headers
      });

      return ResponseParser.createErrorResponse(
        `API Error: ${error.response.status}`,
        {
          status: error.response.status,
          response: error.response.data
        }
      );
    }

    console.error('Network Error:', error.message);
    return ResponseParser.createErrorResponse(
      error.message,
      { code: 'NETWORK_ERROR' }
    );
  }
}

module.exports = { BitqueryAPI };