/**
 * Bitquery API Example
 * 
 * This example demonstrates how to use the BitqueryAPI with QueryBuilder, 
 * ResponseParser, and QueryTemplates to fetch blockchain data.
 */

const { BitqueryAPI } = require('../core/api/BitqueryAPI');
const { QueryBuilder } = require('../core/api/QueryBuilder');
const { ResponseParser } = require('../core/api/ResponseParser');
const { QueryTemplates } = require('../core/api/QueryTemplates');

// Load environment variables
require('dotenv').config();

// Initialize the API with credentials
const api = new BitqueryAPI(
  process.env.BITQUERY_CLIENT_ID,
  process.env.BITQUERY_CLIENT_SECRET
);

/**
 * Example 1: Using QueryTemplates to get token balances
 */
async function getTokenBalances() {
  try {
    console.log('Example 1: Getting token balances for an address');
    
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
    
    // Use QueryTemplates to create a query
    const { query, variables } = QueryTemplates.getTokenBalances(address, {
      limit: 5,
      network: 'ethereum'
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      // Extract specific fields using ResponseParser
      const balances = ResponseParser.extractFields(result, [
        'ethereum.address.balances'
      ]);
      
      console.log('Token balances:', balances['ethereum.address.balances']);
    } else {
      console.error('Error fetching token balances:', result.errors);
    }
  } catch (error) {
    console.error('Error in getTokenBalances:', error);
  }
}

/**
 * Example 2: Using QueryBuilder directly to create a custom query
 */
async function getCustomTokenData() {
  try {
    console.log('\nExample 2: Creating a custom token query with QueryBuilder');
    
    // Create a custom query using QueryBuilder
    const builder = new QueryBuilder();
    const { query, variables } = builder
      .operation('query', 'GetTokenInfo', '$tokenAddress: String!')
      .fragment('TokenData', 'Token', [
        'name',
        'symbol',
        'decimals',
        'totalSupply'
      ])
      .select('ethereum', [
        `token(address: $tokenAddress) {
          ...TokenData
          address
          tokenType
          lastTransferBlock
          lastTransferTimestamp
        }`
      ])
      .setVariables({
        tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
      })
      .build();
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('Token data:', result.data.ethereum.token);
    } else {
      console.error('Error fetching token data:', result.errors);
    }
  } catch (error) {
    console.error('Error in getCustomTokenData:', error);
  }
}

/**
 * Example 3: Using QueryTemplates for transaction history with date filtering
 */
async function getTransactionHistory() {
  try {
    console.log('\nExample 3: Getting transaction history with date filtering');
    
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
    
    // Get transactions from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { query, variables } = QueryTemplates.getTransactionHistory(address, {
      limit: 5,
      from: thirtyDaysAgo.toISOString()
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      // Validate the response schema
      const schema = {
        ethereum: {
          transactions: [{
            hash: 'string',
            block: {
              timestamp: 'string',
              height: 'number'
            }
          }]
        }
      };
      
      const isValid = ResponseParser.validateSchema(result, schema);
      console.log('Schema validation result:', isValid);
      
      if (isValid) {
        console.log('Recent transactions:', result.data.ethereum.transactions);
      }
    } else {
      console.error('Error fetching transaction history:', result.errors);
    }
  } catch (error) {
    console.error('Error in getTransactionHistory:', error);
  }
}

/**
 * Example 4: Using QueryTemplates for token price history
 */
async function getTokenPriceHistory() {
  try {
    console.log('\nExample 4: Getting token price history');
    
    const tokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
    
    // Get daily price data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { query, variables } = QueryTemplates.getTokenPriceHistory(tokenAddress, {
      interval: '1d',
      from: sevenDaysAgo.toISOString()
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('Price history data points:', result.data.ethereum.dexTrades.length);
      console.log('First data point:', result.data.ethereum.dexTrades[0]);
    } else {
      console.error('Error fetching price history:', result.errors);
    }
  } catch (error) {
    console.error('Error in getTokenPriceHistory:', error);
  }
}

/**
 * Example 5: Using QueryTemplates for smart contract events
 */
async function getContractEvents() {
  try {
    console.log('\nExample 5: Getting smart contract events');
    
    // USDC contract
    const contractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    
    const { query, variables } = QueryTemplates.getContractEvents(contractAddress, {
      limit: 5,
      eventSignature: 'Transfer(address,address,uint256)'
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('Contract events:', result.data.ethereum.smartContractEvents);
    } else {
      console.error('Error fetching contract events:', result.errors);
    }
  } catch (error) {
    console.error('Error in getContractEvents:', error);
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    await getTokenBalances();
    await getCustomTokenData();
    await getTransactionHistory();
    await getTokenPriceHistory();
    await getContractEvents();
    
    console.log('\nAll examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runExamples();
}

module.exports = {
  getTokenBalances,
  getCustomTokenData,
  getTransactionHistory,
  getTokenPriceHistory,
  getContractEvents,
  runExamples
}; 