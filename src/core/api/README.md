# Bitquery API Components

This directory contains the core components for interacting with the Bitquery GraphQL API. These components provide a structured way to build queries, execute them, and parse responses.

## Components

### BitqueryAPI

The main API client for interacting with the Bitquery GraphQL API.

```javascript
const { BitqueryAPI } = require('./BitqueryAPI');

// Initialize with credentials
const api = new BitqueryAPI(clientId, clientSecret);

// Execute a query
const result = await api.query(query, variables);
```

Key features:
- OAuth2 authentication
- Automatic retry for failed requests
- Structured error handling
- Support for raw GraphQL queries

### QueryBuilder

A fluent interface for building GraphQL queries.

```javascript
const { QueryBuilder } = require('./QueryBuilder');

// Build a query
const builder = new QueryBuilder();
const { query, variables } = builder
  .operation('query', 'GetTokenInfo', '$tokenAddress: String!')
  .select('ethereum', [
    'token(address: $tokenAddress) { symbol name decimals }'
  ])
  .setVariables({ tokenAddress: '0x123...' })
  .build();
```

Key features:
- Fluent interface for building queries
- Support for fragments
- Proper indentation and formatting
- Variable management

### ResponseParser

Utilities for parsing and validating GraphQL responses.

```javascript
const { ResponseParser } = require('./ResponseParser');

// Parse a response
const result = ResponseParser.parse(response);

// Extract specific fields
const fields = ResponseParser.extractFields(response, [
  'ethereum.token.symbol',
  'ethereum.token.decimals'
]);

// Validate against a schema
const isValid = ResponseParser.validateSchema(response, {
  ethereum: {
    token: {
      symbol: 'string',
      decimals: 'number'
    }
  }
});
```

Key features:
- Standardized response format
- Error handling
- Field extraction
- Schema validation

### QueryTemplates

Pre-built query templates for common blockchain data needs.

```javascript
const { QueryTemplates } = require('./QueryTemplates');

// Get token balances
const { query, variables } = QueryTemplates.getTokenBalances(address, {
  limit: 10,
  network: 'ethereum'
});

// Get transaction history
const { query, variables } = QueryTemplates.getTransactionHistory(address, {
  from: '2023-01-01T00:00:00Z',
  to: '2023-12-31T23:59:59Z'
});
```

Available templates:
- `getTokenBalances(address, options)`
- `getTransactionHistory(address, options)`
- `getTokenPriceHistory(tokenAddress, options)`
- `getContractEvents(contractAddress, options)`

## Usage Examples

See the [examples directory](../../examples/bitquery-api-example.js) for complete usage examples.

## Testing

Each component has a corresponding test file in the `src/tests/core/api` directory:

- `BitqueryAPI.test.js`
- `QueryBuilder.test.js`
- `ResponseParser.test.js`
- `QueryTemplates.test.js`

Integration tests are available in `src/tests/integration/api/bitquery.integration.test.js`.

## Error Handling

All components use a standardized error format:

```javascript
{
  success: false,
  errors: [
    {
      message: 'Error message',
      path: ['path', 'to', 'error'],
      extensions: {
        code: 'ERROR_CODE',
        // Additional error details
      }
    }
  ],
  data: null
}
```

## Authentication

The BitqueryAPI handles authentication automatically. Just provide your client ID and secret when initializing:

```javascript
const api = new BitqueryAPI(
  process.env.BITQUERY_CLIENT_ID,
  process.env.BITQUERY_CLIENT_SECRET
);
```

The API will obtain and manage the access token for you. 