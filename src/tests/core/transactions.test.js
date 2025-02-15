const { BitqueryAPI } = require('../../core/api/BitqueryAPI');
const { TEST_ADDRESSES, NETWORKS } = require('../helpers/constants.test');
const fs = require('fs');
const path = require('path');

describe('GetTransactions Query Tests', () => {
  let api;
  let query;

  beforeAll(async () => {
    // Load the query
    const queryPath = path.join(__dirname, '../../core/queries/eth/transactions.graphql');
    query = fs.readFileSync(queryPath, 'utf8');
    
    // Initialize API client
    api = new BitqueryAPI(process.env.BITQUERY_CLIENT_ID, process.env.BITQUERY_CLIENT_SECRET);
  });

  test('should fetch transactions for an address', async () => {
    const variables = {
      network: NETWORKS.ETHEREUM,
      address: TEST_ADDRESSES.WALLET,
      limit: 5,
      offset: 0
    };

    const result = await api.query(query, variables);
    
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.ethereum).toBeDefined();
    expect(result.data.ethereum.address).toBeDefined();
    expect(result.data.ethereum.address.transactions).toBeInstanceOf(Array);
    expect(result.data.ethereum.address.transactions.length).toBeLessThanOrEqual(5);

    if (result.data.ethereum.address.transactions.length > 0) {
      const tx = result.data.ethereum.address.transactions[0];
      expect(tx.block).toBeDefined();
      expect(tx.block.height).toBeDefined();
      expect(tx.block.timestamp.time).toBeDefined();
      expect(tx.hash).toBeDefined();
      expect(tx.from.address).toBeDefined();
      expect(tx.to.address).toBeDefined();
      expect(tx.value).toBeDefined();
      expect(tx.gas).toBeDefined();
      expect(tx.gasPrice).toBeDefined();
      expect(tx.success).toBeDefined();
      expect(tx.gasUsed).toBeDefined();
      expect(tx.index).toBeDefined();
      expect(tx.nonce).toBeDefined();
      expect(tx.data).toBeDefined();
    }
  });

  test('should handle pagination correctly', async () => {
    const firstPage = await api.query(query, {
      network: NETWORKS.ETHEREUM,
      address: TEST_ADDRESSES.WALLET,
      limit: 2,
      offset: 0
    });

    const secondPage = await api.query(query, {
      network: NETWORKS.ETHEREUM,
      address: TEST_ADDRESSES.WALLET,
      limit: 2,
      offset: 2
    });

    expect(firstPage.data.ethereum.address.transactions).toHaveLength(2);
    expect(secondPage.data.ethereum.address.transactions).toHaveLength(2);
    
    if (firstPage.data.ethereum.address.transactions.length > 0 && secondPage.data.ethereum.address.transactions.length > 0) {
      expect(firstPage.data.ethereum.address.transactions[0].hash)
        .not.toBe(secondPage.data.ethereum.address.transactions[0].hash);
    }
  });

  test('should handle invalid address', async () => {
    const variables = {
      network: NETWORKS.ETHEREUM,
      address: TEST_ADDRESSES.INVALID,
      limit: 5,
      offset: 0
    };

    const result = await api.query(query, variables);
    expect(result.errors).toBeDefined();
  });
}); 