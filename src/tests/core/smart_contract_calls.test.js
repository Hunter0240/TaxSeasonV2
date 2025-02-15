const fs = require('fs');
const path = require('path');
const { TEST_ADDRESSES, NETWORKS, TIMEOUTS } = require('../helpers/constants.test');
const { BitqueryAPI } = require('../../core/api/BitqueryAPI');

describe('Smart Contract Calls Query Tests', () => {
  let api;
  let queryContent;

  beforeAll(async () => {
    api = new BitqueryAPI(
      process.env.BITQUERY_CLIENT_ID,
      process.env.BITQUERY_CLIENT_SECRET
    );
    queryContent = fs.readFileSync(
      path.join(__dirname, '../../core/queries/eth/smart_contract_calls.graphql'),
      'utf8'
    );
  });

  test('should fetch smart contract calls for a valid contract address', async () => {
    const variables = {
      network: NETWORKS.ETHEREUM,
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      till: new Date().toISOString(),
      address: TEST_ADDRESSES.CONTRACT
    };

    const response = await api.query(queryContent, variables);
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(response.data.EVM).toBeDefined();
    expect(response.data.EVM.Calls).toBeInstanceOf(Array);

    if (response.data.EVM.Calls.length > 0) {
      const firstCall = response.data.EVM.Calls[0];
      
      // Check Call object
      expect(firstCall.Call).toBeDefined();
      expect(firstCall.Call.From).toBeDefined();
      expect(firstCall.Call.To).toBeDefined();
      expect(firstCall.Call.Gas).toBeDefined();
      expect(firstCall.Call.GasUsed).toBeDefined();
      expect(firstCall.Call.Success).toBeDefined();
      expect(firstCall.Call.Value).toBeDefined();
      expect(firstCall.Call.Signature).toBeDefined();
      expect(firstCall.Call.Signature.Name).toBeDefined();
      expect(firstCall.Call.Signature.SignatureHash).toBeDefined();
      expect(firstCall.Call.Signature.SignatureType).toBeDefined();
      
      // Check Transaction object
      expect(firstCall.Transaction).toBeDefined();
      expect(firstCall.Transaction.Hash).toBeDefined();
      expect(firstCall.Transaction.From).toBeDefined();
      expect(firstCall.Transaction.To).toBeDefined();
      expect(firstCall.Transaction.Gas).toBeDefined();
      expect(firstCall.Transaction.Type).toBeDefined();
      expect(firstCall.Transaction.Index).toBeDefined();
      
      // Check Block object
      expect(firstCall.Block).toBeDefined();
      expect(firstCall.Block.Time).toBeDefined();
      expect(firstCall.Block.Number).toBeDefined();
      
      // Check Arguments if they exist
      if (firstCall.Arguments && firstCall.Arguments.length > 0) {
        const arg = firstCall.Arguments[0];
        expect(arg.Name).toBeDefined();
        expect(arg.Index).toBeDefined();
        expect(arg.Value).toBeDefined();
      }
    }
  }, TIMEOUTS.API_CALL);

  test('should handle invalid contract address gracefully', async () => {
    const variables = {
      network: NETWORKS.ETHEREUM,
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      till: new Date().toISOString(),
      address: TEST_ADDRESSES.INVALID
    };

    const response = await api.query(queryContent, variables);
    expect(response).toBeDefined();
    expect(response.data).toBeDefined();
    expect(response.data.EVM).toBeDefined();
    expect(response.data.EVM.Calls).toBeInstanceOf(Array);
    expect(response.data.EVM.Calls.length).toBe(0);
  }, TIMEOUTS.API_CALL);
}); 