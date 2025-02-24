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
   * Creates a query to get NFT collection data
   * @param {string} collectionAddress - NFT collection contract address
   * @param {Object} options - Additional options
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {number} options.limit - Maximum number of tokens to return (default: 20)
   * @param {string} options.tokenType - Token type (ERC721, ERC1155)
   * @returns {Object} - Query and variables
   */
  static getNFTCollection(collectionAddress, options = {}) {
    const { 
      network = 'ethereum',
      limit = 20,
      tokenType
    } = options;
    
    const variables = {
      collectionAddress,
      limit
    };
    
    if (tokenType) variables.tokenType = tokenType;
    
    const tokenTypeFilter = tokenType ? 
      'tokenType: { is: $tokenType }' : '';
    
    const variableDefinitions = [
      '$collectionAddress: String!', 
      '$limit: Int!'
    ];
    
    if (tokenType) variableDefinitions.push('$tokenType: String');
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetNFTCollection', variableDefinitions.join(', '))
      .select(network, [
        `nftCollection(address: $collectionAddress) {
          name
          symbol
          totalSupply
          contractType
          tokenStandard
          creator {
            address
          }
          tokens(options: { limit: $limit }, ${tokenTypeFilter}) {
            tokenId
            tokenURI
            lastTransferBlock
            lastTransferTimestamp
            owner {
              address
            }
            metadata {
              name
              description
              image
              attributes {
                trait_type
                value
              }
            }
          }
        }`
      ])
      .setVariables(variables)
      .build();
  }

  /**
   * Creates a query to get NFT ownership data for an address
   * @param {string} ownerAddress - Owner's wallet address
   * @param {Object} options - Additional options
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {number} options.limit - Maximum number of NFTs to return (default: 50)
   * @param {string} options.collectionAddress - Filter by specific collection
   * @returns {Object} - Query and variables
   */
  static getNFTsByOwner(ownerAddress, options = {}) {
    const { 
      network = 'ethereum',
      limit = 50,
      collectionAddress
    } = options;
    
    const variables = {
      ownerAddress,
      limit
    };
    
    if (collectionAddress) variables.collectionAddress = collectionAddress;
    
    const collectionFilter = collectionAddress ? 
      'collection: { address: { is: $collectionAddress } }' : '';
    
    const variableDefinitions = [
      '$ownerAddress: String!', 
      '$limit: Int!'
    ];
    
    if (collectionAddress) variableDefinitions.push('$collectionAddress: String');
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetNFTsByOwner', variableDefinitions.join(', '))
      .select(network, [
        `nftOwnership(
          options: { limit: $limit }
          owner: { is: $ownerAddress }
          ${collectionFilter}
        ) {
          owner {
            address
          }
          amount
          token {
            tokenId
            tokenURI
            collection {
              address
              name
              symbol
              tokenStandard
            }
            metadata {
              name
              description
              image
              attributes {
                trait_type
                value
              }
            }
          }
          lastTransferTimestamp
          lastTransferBlock
        }`
      ])
      .setVariables(variables)
      .build();
  }

  /**
   * Creates a query to get NFT transfer history
   * @param {Object} options - Query options
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {number} options.limit - Maximum number of transfers to return (default: 50)
   * @param {string} options.tokenId - Filter by specific token ID
   * @param {string} options.collectionAddress - Filter by specific collection
   * @param {string} options.from - Start date (ISO format)
   * @param {string} options.to - End date (ISO format)
   * @returns {Object} - Query and variables
   */
  static getNFTTransfers(options = {}) {
    const { 
      network = 'ethereum',
      limit = 50,
      tokenId,
      collectionAddress,
      from,
      to
    } = options;
    
    const variables = { limit };
    const filters = [];
    const variableDefinitions = ['$limit: Int!'];
    
    if (tokenId) {
      variables.tokenId = tokenId;
      variableDefinitions.push('$tokenId: String!');
      filters.push('token: { tokenId: { is: $tokenId } }');
    }
    
    if (collectionAddress) {
      variables.collectionAddress = collectionAddress;
      variableDefinitions.push('$collectionAddress: String!');
      filters.push('token: { collection: { address: { is: $collectionAddress } } }');
    }
    
    // Add date filters if provided
    if (from) {
      variables.from = from;
      variableDefinitions.push('$from: ISO8601DateTime!');
    }
    
    if (to) {
      variables.to = to;
      variableDefinitions.push('$to: ISO8601DateTime!');
    }
    
    const dateFilter = from || to ? 
      `date: {${from ? `since: $from${to ? ', ' : ''}` : ''}${to ? 'till: $to' : ''}}` : '';
    
    if (dateFilter) {
      filters.push(dateFilter);
    }
    
    const filterString = filters.length > 0 ? filters.join(', ') : '';
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetNFTTransfers', variableDefinitions.join(', '))
      .select(network, [
        `nftTransfers(
          options: { limit: $limit, desc: "block.timestamp" }
          ${filterString}
        ) {
          transaction {
            hash
          }
          block {
            timestamp
            height
          }
          token {
            tokenId
            collection {
              address
              name
              symbol
            }
          }
          from {
            address
          }
          to {
            address
          }
          amount
          tokenType
        }`
      ])
      .setVariables(variables)
      .build();
  }

  /**
   * Creates a query to get DEX liquidity pool data
   * @param {Object} options - Query options
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {number} options.limit - Maximum number of pools to return (default: 20)
   * @param {string} options.protocol - Filter by specific protocol (e.g., "Uniswap")
   * @param {string} options.tokenAddress - Filter pools containing this token
   * @returns {Object} - Query and variables
   */
  static getDEXLiquidityPools(options = {}) {
    const { 
      network = 'ethereum',
      limit = 20,
      protocol,
      tokenAddress
    } = options;
    
    const variables = { limit };
    const filters = [];
    const variableDefinitions = ['$limit: Int!'];
    
    if (protocol) {
      variables.protocol = protocol;
      variableDefinitions.push('$protocol: String!');
      filters.push('protocol: { is: $protocol }');
    }
    
    if (tokenAddress) {
      variables.tokenAddress = tokenAddress;
      variableDefinitions.push('$tokenAddress: String!');
      filters.push('baseCurrency: { is: $tokenAddress }');
    }
    
    const filterString = filters.length > 0 ? filters.join(', ') : '';
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetDEXLiquidityPools', variableDefinitions.join(', '))
      .select(network, [
        `liquidityPools(
          options: { limit: $limit, desc: "totalValueLocked" }
          ${filterString}
        ) {
          address
          protocol
          name
          totalValueLocked
          totalValueLockedUSD
          inputTokens {
            address
            symbol
            name
            decimals
            balance
            balanceUSD
          }
          outputToken {
            address
            symbol
            name
            decimals
          }
          feePercent
          volumeUSD24h
          apr
          createdTimestamp
          createdBlockNumber
        }`
      ])
      .setVariables(variables)
      .build();
  }

  /**
   * Creates a query to get DEX swap data
   * @param {Object} options - Query options
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {number} options.limit - Maximum number of swaps to return (default: 50)
   * @param {string} options.protocol - Filter by specific protocol (e.g., "Uniswap")
   * @param {string} options.tokenAddress - Filter swaps involving this token
   * @param {string} options.from - Start date (ISO format)
   * @param {string} options.to - End date (ISO format)
   * @returns {Object} - Query and variables
   */
  static getDEXSwaps(options = {}) {
    const { 
      network = 'ethereum',
      limit = 50,
      protocol,
      tokenAddress,
      from,
      to
    } = options;
    
    const variables = { limit };
    const filters = [];
    const variableDefinitions = ['$limit: Int!'];
    
    if (protocol) {
      variables.protocol = protocol;
      variableDefinitions.push('$protocol: String!');
      filters.push('protocol: { is: $protocol }');
    }
    
    if (tokenAddress) {
      variables.tokenAddress = tokenAddress;
      variableDefinitions.push('$tokenAddress: String!');
      filters.push('tokenIn: { is: $tokenAddress }');
    }
    
    // Add date filters if provided
    if (from) {
      variables.from = from;
      variableDefinitions.push('$from: ISO8601DateTime!');
    }
    
    if (to) {
      variables.to = to;
      variableDefinitions.push('$to: ISO8601DateTime!');
    }
    
    const dateFilter = from || to ? 
      `date: {${from ? `since: $from${to ? ', ' : ''}` : ''}${to ? 'till: $to' : ''}}` : '';
    
    if (dateFilter) {
      filters.push(dateFilter);
    }
    
    const filterString = filters.length > 0 ? filters.join(', ') : '';
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetDEXSwaps', variableDefinitions.join(', '))
      .select(network, [
        `dexTrades(
          options: { limit: $limit, desc: "block.timestamp" }
          ${filterString}
        ) {
          transaction {
            hash
          }
          block {
            timestamp
            height
          }
          protocol
          exchange {
            name
            fullName
          }
          tokenIn {
            address
            symbol
            name
            decimals
          }
          tokenOut {
            address
            symbol
            name
            decimals
          }
          amountIn
          amountOut
          amountInUSD
          amountOutUSD
          trader {
            address
          }
          pool {
            address
            name
          }
        }`
      ])
      .setVariables(variables)
      .build();
  }

  /**
   * Creates a query to get gas price analytics
   * @param {Object} options - Query options
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {string} options.from - Start date (ISO format)
   * @param {string} options.to - End date (ISO format)
   * @param {string} options.interval - Time interval (default: '1d')
   * @returns {Object} - Query and variables
   */
  static getGasPriceAnalytics(options = {}) {
    const { 
      network = 'ethereum',
      from,
      to,
      interval = '1d'
    } = options;
    
    const variables = { interval };
    const variableDefinitions = ['$interval: String!'];
    
    // Add date filters if provided
    if (from) {
      variables.from = from;
      variableDefinitions.push('$from: ISO8601DateTime!');
    }
    
    if (to) {
      variables.to = to;
      variableDefinitions.push('$to: ISO8601DateTime!');
    }
    
    const dateFilter = from || to ? 
      `date: {${from ? `since: $from${to ? ', ' : ''}` : ''}${to ? 'till: $to' : ''}}` : '';
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetGasPriceAnalytics', variableDefinitions.join(', '))
      .select(network, [
        `gasPrice(
          ${dateFilter}
        ) {
          timeInterval {
            ${interval}
          }
          average: gasPrice(calculate: average)
          max: gasPrice(calculate: maximum)
          min: gasPrice(calculate: minimum)
          median: gasPrice(calculate: median)
          gasUsed
          transactionCount
          blockCount
        }`
      ])
      .setVariables(variables)
      .build();
  }

  /**
   * Creates a query to get lending protocol data
   * @param {Object} options - Query options
   * @param {string} options.network - Blockchain network (default: 'ethereum')
   * @param {number} options.limit - Maximum number of markets to return (default: 20)
   * @param {string} options.protocol - Filter by specific protocol (e.g., "Aave", "Compound")
   * @param {string} options.tokenAddress - Filter by specific token
   * @returns {Object} - Query and variables
   */
  static getLendingMarkets(options = {}) {
    const { 
      network = 'ethereum',
      limit = 20,
      protocol,
      tokenAddress
    } = options;
    
    const variables = { limit };
    const filters = [];
    const variableDefinitions = ['$limit: Int!'];
    
    if (protocol) {
      variables.protocol = protocol;
      variableDefinitions.push('$protocol: String!');
      filters.push('protocol: { is: $protocol }');
    }
    
    if (tokenAddress) {
      variables.tokenAddress = tokenAddress;
      variableDefinitions.push('$tokenAddress: String!');
      filters.push('token: { address: { is: $tokenAddress } }');
    }
    
    const filterString = filters.length > 0 ? filters.join(', ') : '';
    
    const builder = new QueryBuilder();
    return builder
      .operation('query', 'GetLendingMarkets', variableDefinitions.join(', '))
      .select(network, [
        `lendingMarkets(
          options: { limit: $limit, desc: "totalValueLocked" }
          ${filterString}
        ) {
          protocol
          marketAddress
          token {
            address
            symbol
            name
            decimals
          }
          totalValueLocked
          totalValueLockedUSD
          supplyRate
          borrowRate
          totalSupply
          totalBorrow
          utilizationRate
          liquidationThreshold
          collateralFactor
          reserveFactor
          lastUpdateTimestamp
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