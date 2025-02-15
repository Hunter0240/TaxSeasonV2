const axios = require('axios');
const rax = require('retry-axios');

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

  async authenticate() {
    if (!this.accessToken) {
      // Create URLSearchParams to send data as form-urlencoded
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
        // Update the headers with the new access token
        this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${this.accessToken}`;
      } catch (error) {
        console.error('Authentication error:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Bitquery API');
      }
    }
  }

  async query(query, variables = {}) {
    try {
      await this.authenticate();
      
      // Debug logging
      console.log('Sending GraphQL query:', {
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

      // Check for GraphQL errors
      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        return response.data; // Return the error response for proper handling
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      console.error('API Error Details:', {
        status: error.response.status,
        data: error.response.data,
        errors: error.response.data.errors,
        headers: error.response.headers
      });

      // Return a structured error response
      return {
        data: null,
        errors: [{
          message: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data.errors)}`,
          extensions: {
            code: error.response.status,
            response: error.response.data
          }
        }]
      };
    }

    console.error('Network Error:', error.message);
    return {
      data: null,
      errors: [{
        message: error.message,
        extensions: {
          code: 'NETWORK_ERROR'
        }
      }]
    };
  }
}

module.exports = { BitqueryAPI };