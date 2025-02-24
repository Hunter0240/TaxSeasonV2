/**
 * Specialized Blockchain Queries Example
 * 
 * This example demonstrates how to use the specialized query templates
 * for NFTs, DeFi, and analytics data.
 */

const { BitqueryAPI } = require('../core/api/BitqueryAPI');
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
 * Example 1: Get NFT Collection Data
 */
async function getNFTCollectionData() {
  try {
    console.log('Example 1: Getting NFT collection data');
    
    // CryptoPunks collection
    const collectionAddress = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB';
    
    // Use QueryTemplates to create a query
    const { query, variables } = QueryTemplates.getNFTCollection(collectionAddress, {
      limit: 5
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('Collection name:', result.data.ethereum.nftCollection.name);
      console.log('Total supply:', result.data.ethereum.nftCollection.totalSupply);
      console.log('Sample tokens:', result.data.ethereum.nftCollection.tokens.length);
    } else {
      console.error('Error fetching NFT collection data:', result.errors);
    }
  } catch (error) {
    console.error('Error in getNFTCollectionData:', error);
  }
}

/**
 * Example 2: Get NFTs Owned by an Address
 */
async function getNFTsOwnedByAddress() {
  try {
    console.log('\nExample 2: Getting NFTs owned by an address');
    
    // Example wallet address
    const ownerAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
    
    // Use QueryTemplates to create a query
    const { query, variables } = QueryTemplates.getNFTsByOwner(ownerAddress, {
      limit: 5
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('NFTs owned:', result.data.ethereum.nftOwnership.length);
      
      // Extract collection names
      const collections = result.data.ethereum.nftOwnership.map(ownership => 
        ownership.token.collection.name
      );
      
      console.log('Collections:', [...new Set(collections)]);
    } else {
      console.error('Error fetching NFTs owned:', result.errors);
    }
  } catch (error) {
    console.error('Error in getNFTsOwnedByAddress:', error);
  }
}

/**
 * Example 3: Get NFT Transfer History
 */
async function getNFTTransferHistory() {
  try {
    console.log('\nExample 3: Getting NFT transfer history');
    
    // BAYC collection
    const collectionAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
    
    // Get transfers from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Use QueryTemplates to create a query
    const { query, variables } = QueryTemplates.getNFTTransfers({
      collectionAddress,
      from: thirtyDaysAgo.toISOString(),
      limit: 5
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('Recent transfers:', result.data.ethereum.nftTransfers.length);
      
      // Show transfer details
      result.data.ethereum.nftTransfers.forEach(transfer => {
        console.log(`Token ID: ${transfer.token.tokenId}, From: ${transfer.from.address.substring(0, 8)}..., To: ${transfer.to.address.substring(0, 8)}...`);
      });
    } else {
      console.error('Error fetching NFT transfers:', result.errors);
    }
  } catch (error) {
    console.error('Error in getNFTTransferHistory:', error);
  }
}

/**
 * Example 4: Get DEX Liquidity Pools
 */
async function getDEXLiquidityPools() {
  try {
    console.log('\nExample 4: Getting DEX liquidity pools');
    
    // Use QueryTemplates to create a query
    const { query, variables } = QueryTemplates.getDEXLiquidityPools({
      protocol: 'Uniswap',
      limit: 5
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('Top Uniswap pools:', result.data.ethereum.liquidityPools.length);
      
      // Show pool details
      result.data.ethereum.liquidityPools.forEach(pool => {
        const tokens = pool.inputTokens.map(token => token.symbol).join('/');
        console.log(`Pool: ${tokens}, TVL: $${parseFloat(pool.totalValueLockedUSD).toLocaleString()}`);
      });
    } else {
      console.error('Error fetching DEX liquidity pools:', result.errors);
    }
  } catch (error) {
    console.error('Error in getDEXLiquidityPools:', error);
  }
}

/**
 * Example 5: Get DEX Swaps
 */
async function getDEXSwaps() {
  try {
    console.log('\nExample 5: Getting DEX swaps');
    
    // WETH token address
    const tokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    
    // Get swaps from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Use QueryTemplates to create a query
    const { query, variables } = QueryTemplates.getDEXSwaps({
      tokenAddress,
      from: oneDayAgo.toISOString(),
      limit: 5
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('Recent WETH swaps:', result.data.ethereum.dexTrades.length);
      
      // Show swap details
      result.data.ethereum.dexTrades.forEach(swap => {
        console.log(`${swap.tokenIn.symbol} → ${swap.tokenOut.symbol}, Amount: $${parseFloat(swap.amountInUSD).toLocaleString()}, Protocol: ${swap.protocol}`);
      });
    } else {
      console.error('Error fetching DEX swaps:', result.errors);
    }
  } catch (error) {
    console.error('Error in getDEXSwaps:', error);
  }
}

/**
 * Example 6: Get Gas Price Analytics
 */
async function getGasPriceAnalytics() {
  try {
    console.log('\nExample 6: Getting gas price analytics');
    
    // Get gas prices for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Use QueryTemplates to create a query
    const { query, variables } = QueryTemplates.getGasPriceAnalytics({
      from: sevenDaysAgo.toISOString(),
      interval: '1d'
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('Gas price data points:', result.data.ethereum.gasPrice.length);
      
      // Show gas price trends
      result.data.ethereum.gasPrice.forEach(dataPoint => {
        const date = new Date(dataPoint.timeInterval.day).toLocaleDateString();
        console.log(`Date: ${date}, Avg Gas: ${parseFloat(dataPoint.average).toFixed(2)} Gwei, Transactions: ${dataPoint.transactionCount}`);
      });
    } else {
      console.error('Error fetching gas price analytics:', result.errors);
    }
  } catch (error) {
    console.error('Error in getGasPriceAnalytics:', error);
  }
}

/**
 * Example 7: Get Lending Markets
 */
async function getLendingMarkets() {
  try {
    console.log('\nExample 7: Getting lending markets');
    
    // Use QueryTemplates to create a query
    const { query, variables } = QueryTemplates.getLendingMarkets({
      protocol: 'Aave',
      limit: 5
    });
    
    // Execute the query
    const result = await api.query(query, variables);
    
    if (result.success) {
      console.log('Top Aave markets:', result.data.ethereum.lendingMarkets.length);
      
      // Show market details
      result.data.ethereum.lendingMarkets.forEach(market => {
        console.log(`Token: ${market.token.symbol}, Supply Rate: ${(parseFloat(market.supplyRate) * 100).toFixed(2)}%, Borrow Rate: ${(parseFloat(market.borrowRate) * 100).toFixed(2)}%, TVL: $${parseFloat(market.totalValueLockedUSD).toLocaleString()}`);
      });
    } else {
      console.error('Error fetching lending markets:', result.errors);
    }
  } catch (error) {
    console.error('Error in getLendingMarkets:', error);
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    await getNFTCollectionData();
    await getNFTsOwnedByAddress();
    await getNFTTransferHistory();
    await getDEXLiquidityPools();
    await getDEXSwaps();
    await getGasPriceAnalytics();
    await getLendingMarkets();
    
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
  getNFTCollectionData,
  getNFTsOwnedByAddress,
  getNFTTransferHistory,
  getDEXLiquidityPools,
  getDEXSwaps,
  getGasPriceAnalytics,
  getLendingMarkets,
  runExamples
}; 