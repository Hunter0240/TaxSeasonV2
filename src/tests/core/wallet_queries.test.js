const { BitqueryAPI } = require('../../core/api/BitqueryAPI');
const fs = require('fs');
const path = require('path');

describe('Wallet Query Tests', () => {
  let api;
  let balanceQuery;
  let externalCallsQuery;
  let internalCallsQuery;
  let transactionsQuery;
  
  const TEST_WALLETS = {
    ETCETERA: process.env.TEST_WALLET_ETCETERA,
    TRADWIFE: process.env.TEST_WALLET_TRADWIFE,
    MOUNTAINROUTE: process.env.TEST_WALLET_MOUNTAINROUTE
  };

  const DATE_RANGE = {
    from: '2023-10-01T00:00:00Z',
    till: '2023-12-31T23:59:59Z'
  };

  beforeAll(async () => {
    // Load all queries
    const queryPath = path.join(__dirname, '../../core/queries/eth');
    balanceQuery = fs.readFileSync(path.join(queryPath, 'balance.graphql'), 'utf8');
    externalCallsQuery = fs.readFileSync(path.join(queryPath, 'external_calls.graphql'), 'utf8');
    internalCallsQuery = fs.readFileSync(path.join(queryPath, 'internal_calls.graphql'), 'utf8');
    transactionsQuery = fs.readFileSync(path.join(queryPath, 'transactions.graphql'), 'utf8');
    
    // Initialize API client
    api = new BitqueryAPI(process.env.BITQUERY_CLIENT_ID, process.env.BITQUERY_CLIENT_SECRET);
  });

  describe('Balance Query Tests', () => {
    Object.entries(TEST_WALLETS).forEach(([name, address]) => {
      test(`should fetch balance for ${name} wallet`, async () => {
        const variables = {
          address: address
        };

        const result = await api.query(balanceQuery, variables);
        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.data.EVM).toBeDefined();
        expect(result.data.EVM.BalanceUpdates).toBeDefined();
        expect(result.data.EVM.BalanceUpdates[0]).toBeDefined();
        expect(result.data.EVM.BalanceUpdates[0].Currency).toBeDefined();
        expect(result.data.EVM.BalanceUpdates[0].sum).toBeDefined();
      });
    });
  });

  describe('External Calls Query Tests', () => {
    Object.entries(TEST_WALLETS).forEach(([name, address]) => {
      test(`should fetch external calls for ${name} wallet`, async () => {
        const variables = {
          network: 'ethereum',
          from: DATE_RANGE.from,
          till: DATE_RANGE.till,
          eoaAddress: address
        };

        const result = await api.query(externalCallsQuery, variables);
        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.data.EVM).toBeDefined();
        expect(result.data.EVM.Calls).toBeInstanceOf(Array);

        // Test structure of returned calls if any exist
        if (result.data.EVM.Calls.length > 0) {
          const firstCall = result.data.EVM.Calls[0];
          
          // Check Call object
          expect(firstCall.Call).toBeDefined();
          expect(firstCall.Call.From).toBeDefined();
          expect(firstCall.Call.To).toBeDefined();
          expect(firstCall.Call.Gas).toBeDefined();
          expect(firstCall.Call.GasUsed).toBeDefined();
          expect(firstCall.Call.Success).toBeDefined();
          expect(firstCall.Call.Value).toBeDefined();
          
          // Check Transaction object
          expect(firstCall.Transaction).toBeDefined();
          expect(firstCall.Transaction.Hash).toBeDefined();
          
          // Check Block object
          expect(firstCall.Block).toBeDefined();
          expect(firstCall.Block.Time).toBeDefined();
          expect(firstCall.Block.Number).toBeDefined();
          
          // Check Arguments
          expect(firstCall.Arguments).toBeInstanceOf(Array);
        }
      });
    });
  });

  describe('Internal Calls Query Tests', () => {
    Object.entries(TEST_WALLETS).forEach(([name, address]) => {
      test(`should fetch internal calls for ${name} wallet`, async () => {
        const variables = {
          network: 'ethereum',
          from: DATE_RANGE.from,
          till: DATE_RANGE.till,
          contractAddress: address
        };

        const result = await api.query(internalCallsQuery, variables);
        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.data.EVM).toBeDefined();
        expect(result.data.EVM.Calls).toBeInstanceOf(Array);

        // Test structure of returned calls if any exist
        if (result.data.EVM.Calls.length > 0) {
          const firstCall = result.data.EVM.Calls[0];
          
          // Check Call object
          expect(firstCall.Call).toBeDefined();
          expect(firstCall.Call.From).toBeDefined();
          expect(firstCall.Call.To).toBeDefined();
          expect(firstCall.Call.Gas).toBeDefined();
          expect(firstCall.Call.GasUsed).toBeDefined();
          expect(firstCall.Call.Success).toBeDefined();
          expect(firstCall.Call.Value).toBeDefined();
          
          // Check Transaction object
          expect(firstCall.Transaction).toBeDefined();
          expect(firstCall.Transaction.Hash).toBeDefined();
          
          // Check Block object
          expect(firstCall.Block).toBeDefined();
          expect(firstCall.Block.Time).toBeDefined();
          expect(firstCall.Block.Number).toBeDefined();
          
          // Check Arguments
          expect(firstCall.Arguments).toBeInstanceOf(Array);
        }
      });
    });
  });

  describe('Transactions Query Tests', () => {
    Object.entries(TEST_WALLETS).forEach(([name, address]) => {
      test(`should fetch transactions for ${name} wallet`, async () => {
        const variables = {
          address: address,
          fromDate: DATE_RANGE.from,
          toDate: DATE_RANGE.till
        };

        const result = await api.query(transactionsQuery, variables);
        expect(result).toBeDefined();
        expect(result.data).toBeDefined();
        expect(result.data.EVM).toBeDefined();
        expect(result.data.EVM.Transactions).toBeInstanceOf(Array);

        if (result.data.EVM.Transactions.length > 0) {
          const tx = result.data.EVM.Transactions[0];
          expect(tx.Block).toBeDefined();
          expect(tx.Block.Time).toBeDefined();
          expect(tx.Block.Number).toBeDefined();
          expect(tx.Transaction).toBeDefined();
          expect(tx.Transaction.Hash).toBeDefined();
          expect(tx.Transaction.From).toBeDefined();
          expect(tx.Transaction.To).toBeDefined();
          expect(tx.Transaction.Value).toBeDefined();
          expect(tx.Transaction.Gas).toBeDefined();
          expect(tx.Transaction.GasPrice).toBeDefined();
          expect(tx.TransactionStatus).toBeDefined();
          expect(tx.TransactionStatus.Success).toBeDefined();
        }
      });
    });
  });
}); 