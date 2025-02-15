const { ChainManager } = require('../../core/chain/ChainManager');

// Test addresses for different scenarios
exports.TEST_ADDRESSES = {
  WHALE: '0x28C6c06298d514Db089934071355E5743bf21d60',    // Binance Hot Wallet
  CONTRACT: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
  WALLET: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',  // Active normal user
  INVALID: 'invalid-address',
  // Personal test wallets
  ETCETERA: process.env.TEST_WALLET_ETCETERA,             // EtCetera wallet
  TRADWIFE: process.env.TEST_WALLET_TRADWIFE,             // TradWife wallet
  MOUNTAINROUTE: process.env.TEST_WALLET_MOUNTAINROUTE    // MountainRoute wallet
};

// Test networks
exports.NETWORKS = {
  ETHEREUM: ChainManager.NETWORKS.ETHEREUM.id,
  BSC: ChainManager.NETWORKS.BSC.id,
  POLYGON: ChainManager.NETWORKS.POLYGON.id,
  INVALID: 'invalid-network'
};

// Common test timeouts
exports.TIMEOUTS = {
  API_CALL: 30000, // 30 seconds
  SETUP: 5000     // 5 seconds
};

// Test data validation helpers
exports.validateTransactionFields = (tx) => {
  expect(tx.block).toBeDefined();
  expect(tx.block).toHaveProperty('height');
  expect(tx.block.timestamp).toBeDefined();
  expect(tx.block.timestamp).toHaveProperty('time');

  expect(tx).toHaveProperty('hash');
  expect(tx).toHaveProperty('from');
  expect(tx).toHaveProperty('to');
  expect(tx).toHaveProperty('value');
  expect(tx).toHaveProperty('gas');
  expect(tx).toHaveProperty('gasPrice');
  expect(tx).toHaveProperty('success');
  expect(tx).toHaveProperty('gasUsed');
  expect(tx).toHaveProperty('index');
  expect(tx).toHaveProperty('nonce');
  expect(tx).toHaveProperty('data');
};

exports.validateTransferFields = (transfer) => {
  expect(transfer.block).toBeDefined();
  expect(transfer.block).toHaveProperty('height');
  expect(transfer.block.timestamp).toBeDefined();
  expect(transfer.block.timestamp).toHaveProperty('time');

  expect(transfer.transaction).toBeDefined();
  expect(transfer.transaction).toHaveProperty('hash');
  expect(transfer.transaction).toHaveProperty('from');
  expect(transfer.transaction).toHaveProperty('to');
  expect(transfer.transaction).toHaveProperty('value');
  expect(transfer.transaction).toHaveProperty('gas');
  expect(transfer.transaction).toHaveProperty('gasPrice');

  expect(transfer).toHaveProperty('amount');
  expect(transfer.currency).toBeDefined();
  expect(transfer.currency).toHaveProperty('symbol');
  expect(transfer.currency).toHaveProperty('name');
  expect(transfer.currency).toHaveProperty('decimals');
  expect(transfer.currency).toHaveProperty('address');
  expect(transfer).toHaveProperty('sender');
  expect(transfer).toHaveProperty('receiver');
  expect(transfer).toHaveProperty('external');
};

exports.validateCallFields = (call) => {
  expect(call.Block).toBeDefined();
  expect(call.Block).toHaveProperty('Number');
  expect(call.Block).toHaveProperty('Time');
  expect(call.Block).toHaveProperty('Date');

  expect(call.Call).toBeDefined();
  expect(call.Call).toHaveProperty('From');
  expect(call.Call).toHaveProperty('To');
  expect(call.Call).toHaveProperty('CallPath');
  expect(call.Call).toHaveProperty('CallerIndex');
  expect(call.Call).toHaveProperty('Create');
  expect(call.Call).toHaveProperty('Delegated');
  expect(call.Call).toHaveProperty('Error');
  expect(call.Call).toHaveProperty('Gas');
  expect(call.Call).toHaveProperty('GasUsed');
  expect(call.Call).toHaveProperty('Index');
  expect(call.Call).toHaveProperty('InternalCalls');
  expect(call.Call).toHaveProperty('Reverted');
  expect(call.Call).toHaveProperty('Success');
  expect(call.Call).toHaveProperty('Value');
  
  expect(call.Call.Signature).toBeDefined();
  expect(call.Call.Signature).toHaveProperty('Name');
  expect(call.Call.Signature).toHaveProperty('SignatureHash');
  expect(call.Call.Signature).toHaveProperty('SignatureType');

  if (call.Arguments && call.Arguments.length > 0) {
    const arg = call.Arguments[0];
    expect(arg).toHaveProperty('Name');
    expect(arg).toHaveProperty('Index');
    expect(arg).toHaveProperty('Value');
    // Value should be one of the supported types
    expect(arg.Value).toMatchObject({
      __typename: expect.any(String),
      string: expect.any(String) || undefined,
      integer: expect.any(String) || undefined,
      address: expect.any(String) || undefined,
      bool: expect.any(Boolean) || undefined,
      bigInteger: expect.any(String) || undefined,
      hex: expect.any(String) || undefined
    });
  }

  expect(call.Transaction).toBeDefined();
  expect(call.Transaction).toHaveProperty('Hash');
  expect(call.Transaction).toHaveProperty('Index');
  expect(call.Transaction).toHaveProperty('Value');
};

exports.validateBalanceFields = (balance) => {
  expect(balance.currency).toBeDefined();
  expect(balance.currency).toHaveProperty('address');
  expect(balance.currency).toHaveProperty('name');
  expect(balance.currency).toHaveProperty('symbol');
  expect(balance.currency).toHaveProperty('decimals');
  expect(balance.currency).toHaveProperty('tokenType');

  expect(balance).toHaveProperty('value');
  expect(balance).toHaveProperty('transferCount');
  expect(balance.lastTransferBlock).toBeDefined();
  expect(balance.lastTransferBlock).toHaveProperty('height');
  expect(balance.lastTransferBlock.timestamp).toBeDefined();
  expect(balance.lastTransferBlock.timestamp).toHaveProperty('time');
};

// Add tests for the constants module
describe('Constants Module', () => {
  test('TEST_ADDRESSES should have valid Ethereum addresses', () => {
    expect(exports.TEST_ADDRESSES.WHALE).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(exports.TEST_ADDRESSES.CONTRACT).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(exports.TEST_ADDRESSES.WALLET).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(exports.TEST_ADDRESSES.INVALID).toBe('invalid-address');
  });

  test('NETWORKS should have valid network names', () => {
    expect(exports.NETWORKS.ETHEREUM).toBe('eth');
    expect(exports.NETWORKS.BSC).toBe('bsc');
    expect(exports.NETWORKS.POLYGON).toBe('matic');
    expect(exports.NETWORKS.INVALID).toBe('invalid-network');
  });

  test('TIMEOUTS should have reasonable values', () => {
    expect(exports.TIMEOUTS.API_CALL).toBe(30000);
    expect(exports.TIMEOUTS.SETUP).toBe(5000);
  });

  test('validation helpers should be functions', () => {
    expect(typeof exports.validateTransactionFields).toBe('function');
    expect(typeof exports.validateTransferFields).toBe('function');
    expect(typeof exports.validateCallFields).toBe('function');
    expect(typeof exports.validateBalanceFields).toBe('function');
  });
}); 