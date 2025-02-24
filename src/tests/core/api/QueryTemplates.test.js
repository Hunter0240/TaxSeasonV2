const { QueryTemplates } = require('../../../core/api/QueryTemplates');
const fs = require('fs');
const path = require('path');

// Mock fs and path for loadQueryFromFile tests
jest.mock('fs');
jest.mock('path');

describe('QueryTemplates', () => {
  describe('Token Balances Query', () => {
    test('should create a token balances query with default options', () => {
      const address = '0x123abc';
      const { query, variables } = QueryTemplates.getTokenBalances(address);
      
      // Check query structure
      expect(query).toContain('query GetTokenBalances');
      expect(query).toContain('$address: String!');
      expect(query).toContain('$limit: Int!');
      expect(query).toContain('address(address: $address)');
      expect(query).toContain('balances(options: { limit: $limit })');
      
      // Check variables
      expect(variables).toEqual({
        address: '0x123abc',
        limit: 100
      });
    });
    
    test('should create a token balances query with custom options', () => {
      const address = '0x123abc';
      const options = {
        limit: 50,
        network: 'bsc'
      };
      
      const { query, variables } = QueryTemplates.getTokenBalances(address, options);
      
      // Check network selection
      expect(query).toContain('bsc {');
      
      // Check variables
      expect(variables).toEqual({
        address: '0x123abc',
        limit: 50
      });
    });
  });
  
  describe('Transaction History Query', () => {
    test('should create a transaction history query with default options', () => {
      const address = '0x123abc';
      const { query, variables } = QueryTemplates.getTransactionHistory(address);
      
      // Check query structure
      expect(query).toContain('query GetTransactionHistory');
      expect(query).toContain('$address: String!');
      expect(query).toContain('$limit: Int!');
      expect(query).toContain('transactions(');
      expect(query).toContain('address: { is: $address }');
      
      // Check variables
      expect(variables).toEqual({
        address: '0x123abc',
        limit: 50
      });
    });
    
    test('should create a transaction history query with date filters', () => {
      const address = '0x123abc';
      const options = {
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z',
        network: 'polygon'
      };
      
      const { query, variables } = QueryTemplates.getTransactionHistory(address, options);
      
      // Check date filter
      expect(query).toContain('$from: ISO8601DateTime');
      expect(query).toContain('$to: ISO8601DateTime');
      expect(query).toContain('date: {since: $from, till: $to}');
      
      // Check network selection
      expect(query).toContain('polygon {');
      
      // Check variables
      expect(variables).toEqual({
        address: '0x123abc',
        limit: 50,
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z'
      });
    });
    
    test('should handle partial date filters', () => {
      const address = '0x123abc';
      const options = {
        from: '2023-01-01T00:00:00Z'
      };
      
      const { query, variables } = QueryTemplates.getTransactionHistory(address, options);
      
      // Check date filter
      expect(query).toContain('$from: ISO8601DateTime');
      expect(query).not.toContain('$to: ISO8601DateTime');
      expect(query).toContain('date: {since: $from}');
      
      // Check variables
      expect(variables).toEqual({
        address: '0x123abc',
        limit: 50,
        from: '2023-01-01T00:00:00Z'
      });
    });
  });
  
  describe('Token Price History Query', () => {
    test('should create a token price history query with default options', () => {
      const tokenAddress = '0x123abc';
      const { query, variables } = QueryTemplates.getTokenPriceHistory(tokenAddress);
      
      // Check query structure
      expect(query).toContain('query GetTokenPriceHistory');
      expect(query).toContain('$tokenAddress: String!');
      expect(query).toContain('$quoteSymbol: String!');
      expect(query).toContain('$interval: String!');
      expect(query).toContain('baseCurrency: { is: $tokenAddress }');
      expect(query).toContain('quoteCurrency: { symbol: { is: $quoteSymbol } }');
      expect(query).toContain('timeInterval {');
      expect(query).toContain('1d');
      
      // Check variables
      expect(variables).toEqual({
        tokenAddress: '0x123abc',
        quoteSymbol: 'USD',
        interval: '1d'
      });
    });
    
    test('should create a token price history query with custom options', () => {
      const tokenAddress = '0x123abc';
      const options = {
        quoteSymbol: 'ETH',
        interval: '1h',
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z',
        network: 'arbitrum'
      };
      
      const { query, variables } = QueryTemplates.getTokenPriceHistory(tokenAddress, options);
      
      // Check custom options
      expect(query).toContain('arbitrum {');
      expect(query).toContain('timeInterval {');
      expect(query).toContain('1h');
      expect(query).toContain('date: {since: $from, till: $to}');
      
      // Check variables
      expect(variables).toEqual({
        tokenAddress: '0x123abc',
        quoteSymbol: 'ETH',
        interval: '1h',
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z'
      });
    });
  });
  
  describe('Contract Events Query', () => {
    test('should create a contract events query with default options', () => {
      const contractAddress = '0x123abc';
      const { query, variables } = QueryTemplates.getContractEvents(contractAddress);
      
      // Check query structure
      expect(query).toContain('query GetContractEvents');
      expect(query).toContain('$contractAddress: String!');
      expect(query).toContain('$limit: Int!');
      expect(query).toContain('smartContractAddress: { is: $contractAddress }');
      expect(query).not.toContain('smartContractEvent:');
      
      // Check variables
      expect(variables).toEqual({
        contractAddress: '0x123abc',
        limit: 50
      });
    });
    
    test('should create a contract events query with event signature filter', () => {
      const contractAddress = '0x123abc';
      const options = {
        eventSignature: 'Transfer(address,address,uint256)',
        network: 'optimism'
      };
      
      const { query, variables } = QueryTemplates.getContractEvents(contractAddress, options);
      
      // Check event filter
      expect(query).toContain('$eventSignature: String');
      expect(query).toContain('smartContractEvent: { signature: { is: $eventSignature } }');
      expect(query).toContain('optimism {');
      
      // Check variables
      expect(variables).toEqual({
        contractAddress: '0x123abc',
        limit: 50,
        eventSignature: 'Transfer(address,address,uint256)'
      });
    });
  });
  
  describe('NFT Collection Query', () => {
    test('should create an NFT collection query with default options', () => {
      const collectionAddress = '0x123abc';
      const { query, variables } = QueryTemplates.getNFTCollection(collectionAddress);
      
      // Check query structure
      expect(query).toContain('query GetNFTCollection');
      expect(query).toContain('$collectionAddress: String!');
      expect(query).toContain('$limit: Int!');
      expect(query).toContain('nftCollection(address: $collectionAddress)');
      expect(query).toContain('tokens(options: { limit: $limit }');
      
      // Check variables
      expect(variables).toEqual({
        collectionAddress: '0x123abc',
        limit: 20
      });
    });
    
    test('should create an NFT collection query with token type filter', () => {
      const collectionAddress = '0x123abc';
      const options = {
        tokenType: 'ERC721',
        network: 'polygon'
      };
      
      const { query, variables } = QueryTemplates.getNFTCollection(collectionAddress, options);
      
      // Check token type filter
      expect(query).toContain('$tokenType: String');
      expect(query).toContain('tokenType: { is: $tokenType }');
      expect(query).toContain('polygon {');
      
      // Check variables
      expect(variables).toEqual({
        collectionAddress: '0x123abc',
        limit: 20,
        tokenType: 'ERC721'
      });
    });
  });
  
  describe('NFTs By Owner Query', () => {
    test('should create an NFTs by owner query with default options', () => {
      const ownerAddress = '0x123abc';
      const { query, variables } = QueryTemplates.getNFTsByOwner(ownerAddress);
      
      // Check query structure
      expect(query).toContain('query GetNFTsByOwner');
      expect(query).toContain('$ownerAddress: String!');
      expect(query).toContain('$limit: Int!');
      expect(query).toContain('nftOwnership(');
      expect(query).toContain('owner: { is: $ownerAddress }');
      
      // Check variables
      expect(variables).toEqual({
        ownerAddress: '0x123abc',
        limit: 50
      });
    });
    
    test('should create an NFTs by owner query with collection filter', () => {
      const ownerAddress = '0x123abc';
      const options = {
        collectionAddress: '0x456def',
        network: 'bsc'
      };
      
      const { query, variables } = QueryTemplates.getNFTsByOwner(ownerAddress, options);
      
      // Check collection filter
      expect(query).toContain('$collectionAddress: String');
      expect(query).toContain('collection: { address: { is: $collectionAddress } }');
      expect(query).toContain('bsc {');
      
      // Check variables
      expect(variables).toEqual({
        ownerAddress: '0x123abc',
        limit: 50,
        collectionAddress: '0x456def'
      });
    });
  });
  
  describe('NFT Transfers Query', () => {
    test('should create an NFT transfers query with default options', () => {
      const { query, variables } = QueryTemplates.getNFTTransfers();
      
      // Check query structure
      expect(query).toContain('query GetNFTTransfers');
      expect(query).toContain('$limit: Int!');
      expect(query).toContain('nftTransfers(');
      expect(query).toContain('options: { limit: $limit, desc: "block.timestamp" }');
      
      // Check variables
      expect(variables).toEqual({
        limit: 50
      });
    });
    
    test('should create an NFT transfers query with multiple filters', () => {
      const options = {
        tokenId: '123',
        collectionAddress: '0x456def',
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z',
        network: 'arbitrum'
      };
      
      const { query, variables } = QueryTemplates.getNFTTransfers(options);
      
      // Check filters
      expect(query).toContain('$tokenId: String!');
      expect(query).toContain('$collectionAddress: String!');
      expect(query).toContain('$from: ISO8601DateTime!');
      expect(query).toContain('$to: ISO8601DateTime!');
      expect(query).toContain('token: { tokenId: { is: $tokenId } }');
      expect(query).toContain('token: { collection: { address: { is: $collectionAddress } } }');
      expect(query).toContain('date: {since: $from, till: $to}');
      expect(query).toContain('arbitrum {');
      
      // Check variables
      expect(variables).toEqual({
        limit: 50,
        tokenId: '123',
        collectionAddress: '0x456def',
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z'
      });
    });
  });
  
  describe('DEX Liquidity Pools Query', () => {
    test('should create a DEX liquidity pools query with default options', () => {
      const { query, variables } = QueryTemplates.getDEXLiquidityPools();
      
      // Check query structure
      expect(query).toContain('query GetDEXLiquidityPools');
      expect(query).toContain('$limit: Int!');
      expect(query).toContain('liquidityPools(');
      expect(query).toContain('options: { limit: $limit, desc: "totalValueLocked" }');
      
      // Check variables
      expect(variables).toEqual({
        limit: 20
      });
    });
    
    test('should create a DEX liquidity pools query with protocol and token filters', () => {
      const options = {
        protocol: 'Uniswap',
        tokenAddress: '0x123abc',
        network: 'optimism'
      };
      
      const { query, variables } = QueryTemplates.getDEXLiquidityPools(options);
      
      // Check filters
      expect(query).toContain('$protocol: String!');
      expect(query).toContain('$tokenAddress: String!');
      expect(query).toContain('protocol: { is: $protocol }');
      expect(query).toContain('baseCurrency: { is: $tokenAddress }');
      expect(query).toContain('optimism {');
      
      // Check variables
      expect(variables).toEqual({
        limit: 20,
        protocol: 'Uniswap',
        tokenAddress: '0x123abc'
      });
    });
  });
  
  describe('DEX Swaps Query', () => {
    test('should create a DEX swaps query with default options', () => {
      const { query, variables } = QueryTemplates.getDEXSwaps();
      
      // Check query structure
      expect(query).toContain('query GetDEXSwaps');
      expect(query).toContain('$limit: Int!');
      expect(query).toContain('dexTrades(');
      expect(query).toContain('options: { limit: $limit, desc: "block.timestamp" }');
      
      // Check variables
      expect(variables).toEqual({
        limit: 50
      });
    });
    
    test('should create a DEX swaps query with multiple filters', () => {
      const options = {
        protocol: 'Uniswap',
        tokenAddress: '0x123abc',
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z',
        network: 'polygon'
      };
      
      const { query, variables } = QueryTemplates.getDEXSwaps(options);
      
      // Check filters
      expect(query).toContain('$protocol: String!');
      expect(query).toContain('$tokenAddress: String!');
      expect(query).toContain('$from: ISO8601DateTime!');
      expect(query).toContain('$to: ISO8601DateTime!');
      expect(query).toContain('protocol: { is: $protocol }');
      expect(query).toContain('tokenIn: { is: $tokenAddress }');
      expect(query).toContain('date: {since: $from, till: $to}');
      expect(query).toContain('polygon {');
      
      // Check variables
      expect(variables).toEqual({
        limit: 50,
        protocol: 'Uniswap',
        tokenAddress: '0x123abc',
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z'
      });
    });
  });
  
  describe('Gas Price Analytics Query', () => {
    test('should create a gas price analytics query with default options', () => {
      const { query, variables } = QueryTemplates.getGasPriceAnalytics();
      
      // Check query structure
      expect(query).toContain('query GetGasPriceAnalytics');
      expect(query).toContain('$interval: String!');
      expect(query).toContain('gasPrice(');
      expect(query).toContain('timeInterval {');
      expect(query).toContain('1d');
      
      // Check variables
      expect(variables).toEqual({
        interval: '1d'
      });
    });
    
    test('should create a gas price analytics query with date filters', () => {
      const options = {
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z',
        interval: '1h',
        network: 'arbitrum'
      };
      
      const { query, variables } = QueryTemplates.getGasPriceAnalytics(options);
      
      // Check filters
      expect(query).toContain('$from: ISO8601DateTime!');
      expect(query).toContain('$to: ISO8601DateTime!');
      expect(query).toContain('date: {since: $from, till: $to}');
      expect(query).toContain('arbitrum {');
      expect(query).toContain('1h');
      
      // Check variables
      expect(variables).toEqual({
        interval: '1h',
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z'
      });
    });
  });
  
  describe('Lending Markets Query', () => {
    test('should create a lending markets query with default options', () => {
      const { query, variables } = QueryTemplates.getLendingMarkets();
      
      // Check query structure
      expect(query).toContain('query GetLendingMarkets');
      expect(query).toContain('$limit: Int!');
      expect(query).toContain('lendingMarkets(');
      expect(query).toContain('options: { limit: $limit, desc: "totalValueLocked" }');
      
      // Check variables
      expect(variables).toEqual({
        limit: 20
      });
    });
    
    test('should create a lending markets query with protocol and token filters', () => {
      const options = {
        protocol: 'Aave',
        tokenAddress: '0x123abc',
        network: 'polygon'
      };
      
      const { query, variables } = QueryTemplates.getLendingMarkets(options);
      
      // Check filters
      expect(query).toContain('$protocol: String!');
      expect(query).toContain('$tokenAddress: String!');
      expect(query).toContain('protocol: { is: $protocol }');
      expect(query).toContain('token: { address: { is: $tokenAddress } }');
      expect(query).toContain('polygon {');
      
      // Check variables
      expect(variables).toEqual({
        limit: 20,
        protocol: 'Aave',
        tokenAddress: '0x123abc'
      });
    });
  });
  
  describe('Load Query From File', () => {
    test('should load a query from a file', () => {
      const mockQuery = 'query TestQuery { test { field } }';
      const mockPath = '/path/to/query.graphql';
      
      // Mock fs.readFileSync and path.resolve
      fs.readFileSync.mockReturnValue(mockQuery);
      path.resolve.mockReturnValue(mockPath);
      
      const result = QueryTemplates.loadQueryFromFile(mockPath);
      
      expect(fs.readFileSync).toHaveBeenCalledWith(mockPath, 'utf8');
      expect(result).toBe(mockQuery);
    });
    
    test('should throw an error if file loading fails', () => {
      const mockPath = '/path/to/nonexistent.graphql';
      
      // Mock fs.readFileSync to throw an error
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      path.resolve.mockReturnValue(mockPath);
      
      expect(() => {
        QueryTemplates.loadQueryFromFile(mockPath);
      }).toThrow('Failed to load query from /path/to/nonexistent.graphql');
    });
  });
  
  describe('Real World Examples', () => {
    test('should create a complex token balance query for multiple networks', () => {
      const address = '0x123abc';
      const options = {
        network: 'ethereum',
        limit: 10
      };
      
      const { query, variables } = QueryTemplates.getTokenBalances(address, options);
      
      // Verify the query structure matches what we'd expect in a real-world scenario
      expect(query).toContain('query GetTokenBalances');
      expect(query).toContain('ethereum {');
      expect(query).toContain('address(address: $address)');
      expect(query).toContain('balances(options: { limit: $limit })');
      expect(query).toContain('currency {');
      expect(query).toContain('symbol');
      expect(query).toContain('name');
      expect(query).toContain('address');
      expect(query).toContain('decimals');
      expect(query).toContain('tokenType');
      expect(query).toContain('value');
      expect(query).toContain('valueUSD');
      
      // Check variables
      expect(variables).toEqual({
        address: '0x123abc',
        limit: 10
      });
    });
  });
}); 