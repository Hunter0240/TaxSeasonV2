const { QueryBuilder } = require('./QueryBuilder');
const fs = require('fs');
const path = require('path');

/**
 * QueryTemplates provides pre-built query templates for common blockchain data needs
 * using the QueryBuilder to construct standardized GraphQL queries.
 */
class QueryTemplates {
  /**
   * Creates a query to get token balances for an address
   * @param {string} address - Wallet address
   * @param {Object} options - Additional options
   * @param {number} options.limit - Maximum number of results
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @returns {Object} - Query and variables
   */
  static getTokenBalances(address, options = {}) {
    const { limit = 100, network = 'ethereum' } = options;
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetTokenBalances', '$address: String!, $limit: Int!')
      .select(network, [
        `address(address: $address) {
          balances(options: { limit: $limit }) {
            currency {
              symbol
              name
              address
              decimals
              tokenType
            }
            value
            valueUSD
          }
        }`
      ])
      .setVariables({
        address,
        limit
      })
      .build();
  }

  /**
   * Creates a query to get transaction history for an address
   * @param {string} address - Wallet address
   * @param {Object} options - Additional options
   * @param {number} options.limit - Maximum number of results
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {string} options.from - Start date (ISO format)
   * @param {string} options.to - End date (ISO format)
   * @returns {Object} - Query and variables
   */
  static getTransactionHistory(address, options = {}) {
    const { 
      limit = 50, 
      network = 'ethereum',
      from,
      to
    } = options;
    
    const variables = {
      address,
      limit
    };
    
    // Add date filters if provided
    if (from) variables.from = from;
    if (to) variables.to = to;
    
    const dateFilter = from || to ? 
      `date: {${from ? `since: $from${to ? ', ' : ''}` : ''}${to ? 'till: $to' : ''}}` : '';
    
    const variableDefinitions = [
      '$address: String!', 
      '$limit: Int!'
    ];
    
    if (from) variableDefinitions.push('$from: ISO8601DateTime');
    if (to) variableDefinitions.push('$to: ISO8601DateTime');
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetTransactionHistory', variableDefinitions.join(', '))
      .select(network, [
        `transactions(
          options: { limit: $limit, desc: "block.timestamp" }
          address: { is: $address }
          ${dateFilter}
        ) {
          hash
          block {
            timestamp
            height
          }
          from {
            address
          }
          to {
            address
          }
          value
          gasValue
          gasPrice
          success
        }`
      ])
      .setVariables(variables)
      .build();
  }

  /**
   * Creates a query to get token price data
   * @param {string} tokenAddress - Token contract address
   * @param {Object} options - Additional options
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {string} options.quoteSymbol - Quote currency symbol (default: 'USD')
   * @param {string} options.from - Start date (ISO format)
   * @param {string} options.to - End date (ISO format)
   * @param {string} options.interval - Time interval (default: '1d')
   * @returns {Object} - Query and variables
   */
  static getTokenPriceHistory(tokenAddress, options = {}) {
    const { 
      network = 'ethereum',
      quoteSymbol = 'USD',
      from,
      to,
      interval = '1d'
    } = options;
    
    const variables = {
      tokenAddress,
      quoteSymbol,
      interval
    };
    
    // Add date filters if provided
    if (from) variables.from = from;
    if (to) variables.to = to;
    
    const dateFilter = from || to ? 
      `date: {${from ? `since: $from${to ? ', ' : ''}` : ''}${to ? 'till: $to' : ''}}` : '';
    
    const variableDefinitions = [
      '$tokenAddress: String!', 
      '$quoteSymbol: String!',
      '$interval: String!'
    ];
    
    if (from) variableDefinitions.push('$from: ISO8601DateTime');
    if (to) variableDefinitions.push('$to: ISO8601DateTime');
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetTokenPriceHistory', variableDefinitions.join(', '))
      .select(network, [
        `dexTrades(
          options: { limit: 1000, asc: "timeInterval.minute" }
          baseCurrency: { is: $tokenAddress }
          quoteCurrency: { symbol: { is: $quoteSymbol } }
          ${dateFilter}
        ) {
          timeInterval {
            ${interval}
          }
          baseCurrency {
            symbol
            address
          }
          quoteCurrency {
            symbol
          }
          quotePrice
          baseAmount
          quoteAmount
          tradeAmount(in: $quoteSymbol)
          maximum_price: quotePrice(calculate: maximum)
          minimum_price: quotePrice(calculate: minimum)
          open_price: minimum(of: block, get: quote_price)
          close_price: maximum(of: block, get: quote_price)
        }`
      ])
      .setVariables(variables)
      .build();
  }

  /**
   * Creates a query to get smart contract events
   * @param {string} contractAddress - Smart contract address
   * @param {Object} options - Additional options
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {number} options.limit - Maximum number of results (default: 50)
   * @param {string} options.eventSignature - Event signature to filter by
   * @returns {Object} - Query and variables
   */
  static getContractEvents(contractAddress, options = {}) {
    const { 
      network = 'ethereum',
      limit = 50,
      eventSignature
    } = options;
    
    const variables = {
      contractAddress,
      limit
    };
    
    if (eventSignature) variables.eventSignature = eventSignature;
    
    const eventFilter = eventSignature ? 
      'smartContractEvent: { signature: { is: $eventSignature } }' : '';
    
    const variableDefinitions = [
      '$contractAddress: String!', 
      '$limit: Int!'
    ];
    
    if (eventSignature) variableDefinitions.push('$eventSignature: String');
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetContractEvents', variableDefinitions.join(', '))
      .select(network, [
        `smartContractEvents(
          options: { limit: $limit, desc: "block.timestamp" }
          smartContractAddress: { is: $contractAddress }
          ${eventFilter}
        ) {
          transaction {
            hash
          }
          block {
            timestamp
            height
          }
          eventIndex
          eventSignature
          eventName
          arguments {
            name
            type
            value
            valueType
          }
        }`
      ])
      .setVariables(variables)
      .build();
  }

  /**
   * Load a query from a .graphql file
   * @param {string} filePath - Path to the .graphql file
   * @returns {string} - Raw GraphQL query
   */
  static loadQueryFromFile(filePath) {
    try {
      return fs.readFileSync(path.resolve(filePath), 'utf8');
    } catch (error) {
      console.error(`Error loading query from ${filePath}:`, error);
      throw new Error(`Failed to load query from ${filePath}`);
    }
  }
}

module.exports = { QueryTemplates }; 