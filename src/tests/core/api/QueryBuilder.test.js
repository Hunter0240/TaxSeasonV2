const { QueryBuilder } = require('../../../core/api/QueryBuilder');

describe('QueryBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new QueryBuilder();
  });

  describe('Basic Query Building', () => {
    test('should create a simple query', () => {
      const { query } = builder
        .operation('query')
        .field('hello')
        .build();

      expect(query.trim()).toBe('query {\n  hello\n}');
    });

    test('should create a named query', () => {
      const { query } = builder
        .operation('query', 'TestQuery')
        .field('world')
        .build();

      expect(query.trim()).toBe('query TestQuery {\n  world\n}');
    });

    test('should create a query with variables', () => {
      const { query, variables } = builder
        .operation('query', 'TestQuery', '$id: ID!')
        .field('user', null, 'id: $id')
        .setVariables({ id: '123' })
        .build();

      expect(query.trim()).toBe('query TestQuery($id: ID!) {\n  user(id: $id)\n}');
      expect(variables).toEqual({ id: '123' });
    });
  });

  describe('Nested Queries', () => {
    test('should handle nested fields', () => {
      const { query } = builder
        .operation('query')
        .select('user', ['name', 'email'])
        .build();

      expect(query.trim()).toBe(
        'query {\n  user {\n    name\n    email\n  }\n}'
      );
    });

    test('should handle nested fields with arguments', () => {
      const { query } = builder
        .operation('query')
        .select('user', ['name', 'email'], null, 'id: "123"')
        .build();

      expect(query.trim()).toBe(
        'query {\n  user(id: "123") {\n    name\n    email\n  }\n}'
      );
    });
  });

  describe('Fragments', () => {
    test('should create and use fragments', () => {
      const { query } = builder
        .fragment('UserFields', 'User', ['id', 'name', 'email'])
        .operation('query')
        .field('user')
        .spread('UserFields')
        .build();

      expect(query).toContain('fragment UserFields on User {');
      expect(query).toContain('...UserFields');
    });

    test('should handle multiple fragments', () => {
      const { query } = builder
        .fragment('UserFields', 'User', ['id', 'name'])
        .fragment('ProfileFields', 'Profile', ['bio', 'avatar'])
        .operation('query')
        .select('user', [])
        .spread('UserFields')
        .spread('ProfileFields')
        .build();

      expect(query).toContain('fragment UserFields on User {');
      expect(query).toContain('fragment ProfileFields on Profile {');
      expect(query).toContain('...UserFields');
      expect(query).toContain('...ProfileFields');
    });
  });

  describe('Static Methods', () => {
    test('createQuery should generate a basic query', () => {
      const { query } = QueryBuilder.createQuery(
        'GetUser',
        ['id', 'name', 'email']
      );

      expect(query).toContain('query GetUser');
      expect(query).toContain('id');
      expect(query).toContain('name');
      expect(query).toContain('email');
    });

    test('createQuery should handle variables', () => {
      const { query, variables } = QueryBuilder.createQuery(
        'GetUser',
        ['id', 'name'],
        { userId: '123' }
      );

      expect(query).toContain('$userId: String!');
      expect(variables).toEqual({ userId: '123' });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty queries', () => {
      const { query } = builder
        .operation('query')
        .build();

      expect(query.trim()).toBe('query {\n}');
    });

    test('should handle field aliases', () => {
      const { query } = builder
        .operation('query')
        .field('user', 'currentUser')
        .build();

      expect(query.trim()).toBe('query {\n  currentUser: user\n}');
    });

    test('should merge variables', () => {
      const { variables } = builder
        .setVariables({ a: 1 })
        .setVariables({ b: 2 })
        .build();

      expect(variables).toEqual({ a: 1, b: 2 });
    });
  });

  describe('Real World Examples', () => {
    test('should build a token price query', () => {
      const { query, variables } = builder
        .operation('query', 'GetTokenPrice', '$token: String!, $network: String!')
        .select('ethereum', [
          'dexTrades(options: { limit: 1, desc: "block.timestamp" }, tokenAddress: $token) { price }'
        ])
        .setVariables({
          token: '0x123',
          network: 'ethereum'
        })
        .build();

      expect(query).toContain('query GetTokenPrice($token: String!, $network: String!)');
      expect(query).toContain('dexTrades(options: { limit: 1, desc: "block.timestamp" }');
      expect(variables).toEqual({
        token: '0x123',
        network: 'ethereum'
      });
    });

    test('should build a transaction history query', () => {
      const { query } = builder
        .fragment('TxFields', 'Transaction', [
          'hash',
          'blockNumber',
          'timestamp',
          'value'
        ])
        .operation('query', 'GetTransactions', '$address: String!')
        .select('ethereum', [
          'transactions(address: $address, limit: 10) { ...TxFields }'
        ])
        .build();

      expect(query).toContain('fragment TxFields on Transaction');
      expect(query).toContain('query GetTransactions($address: String!)');
      expect(query).toContain('transactions(address: $address, limit: 10)');
    });
  });
}); 