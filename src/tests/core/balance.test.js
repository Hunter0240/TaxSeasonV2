const { BitqueryAPI } = require('../../core/api/BitqueryAPI');
const { TEST_ADDRESSES } = require('../helpers/constants.test');
const fs = require('fs');
const path = require('path');

describe('Balance Query Tests', () => {
  let api;
  let balanceQuery;

  beforeAll(async () => {
    // Load the query
    const queryPath = path.join(__dirname, '../../core/queries/eth/balance.graphql');
    balanceQuery = fs.readFileSync(queryPath, 'utf8');
    
    // Initialize API client
    api = new BitqueryAPI(process.env.BITQUERY_CLIENT_ID, process.env.BITQUERY_CLIENT_SECRET);
  });

  test('should fetch token balances with USD values', async () => {
    const variables = {
      address: "0x674bdf20a0f284d710bc40872100128e2d66bd3f"
    };

    const result = await api.query(balanceQuery, variables);
    console.log('Balance Response:', JSON.stringify(result, null, 2));
    
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.ethereum).toBeDefined();
    expect(result.data.ethereum.address).toBeInstanceOf(Array);

    const addressData = result.data.ethereum.address[0];
    expect(addressData).toBeDefined();
    expect(addressData.balances).toBeInstanceOf(Array);

    if (addressData.balances.length > 0) {
      const balance = addressData.balances[0];
      expect(balance.value).toBeDefined();
      expect(balance.value_usd).toBeDefined();
      expect(balance.currency).toBeDefined();
      expect(balance.currency.address).toBeDefined();
      expect(balance.currency.symbol).toBeDefined();
      expect(balance.currency.name).toBeDefined();
    }
  });

  test('should handle invalid address', async () => {
    const variables = {
      address: 'invalid_address'
    };

    const result = await api.query(balanceQuery, variables);
    expect(result.errors).toBeDefined();
  });
}); 