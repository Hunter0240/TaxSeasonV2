# TaxSeason v2

A comprehensive cryptocurrency tax calculation and reporting tool, focused on accurate tracking of DeFi transactions and positions.

## Core Features

- Robust API integration with Bitquery
- Accurate price tracking and caching
- Support for multiple DeFi protocols
- Detailed transaction analysis
- Comprehensive tax calculations
- Flexible reporting options


## Development Commands

- `npm start` - Run the application
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run linter
- `npm run debug` - Run with debugger

## Environment Variables

- `BITQUERY_CLIENT_ID` - Your Bitquery OAuth2 client ID
- `BITQUERY_CLIENT_SECRET` - Your Bitquery OAuth2 client secret
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level
- `PRICE_CACHE_TTL` - Cache TTL in milliseconds
- `MAX_RETRIES` - Maximum API retry attempts (default: 3)
- `RETRY_DELAY` - Delay between retries in milliseconds (default: 1000)

# Development Roadmap

## Phase 1: Core Infrastructure

### 1.1 BitqueryAPI Module
- [x] Project setup and configuration
- [x] Base API client implementation
  - [x] OAuth2 authentication
  - [x] Token management
  - [x] Error handling
  - [x] Retry mechanism
- [ ] Query builder utilities
- [ ] Response parsing and validation
- [x] Unit tests for API client
  - [x] Authentication flow
  - [x] Basic GraphQL queries
  - [ ] Error scenarios
  - [ ] Rate limiting tests

### 1.2 PriceFeed Module
- [ ] Price fetching implementation
  - [ ] Current price queries
  - [ ] Historical price queries
  - [ ] Batch price queries
- [ ] Caching system
  - [ ] File-based cache
  - [ ] Cache invalidation
  - [ ] Cache optimization
- [ ] Price normalization utilities
- [ ] Unit tests for price feed

## Phase 2: Transaction Manager

### 2.1 Base Transaction Fetchers
- [ ] NormalTransferFetcher
  - [ ] ETH transfers
  - [ ] Native token transfers
  - [ ] Transaction metadata
- [ ] TokenTransferFetcher
  - [ ] ERC20 transfers
  - [ ] Token metadata
  - [ ] Smart contract interactions
- [ ] ProtocolFetcher (Base class)
  - [ ] Common protocol patterns
  - [ ] Event signature handling
  - [ ] Transaction parsing utilities

### 2.2 Protocol Handlers
- [ ] GMXHandler
  - [ ] Position tracking
  - [ ] Leverage detection
  - [ ] Liquidation events
  - [ ] PnL calculations
  - [ ] Fee tracking
- [ ] PendleHandler
  - [ ] Yield token tracking
  - [ ] LP positions
  - [ ] Yield harvesting
  - [ ] SY tokens
- [ ] UniswapHandler
  - [ ] Swap detection
  - [ ] Liquidity positions
  - [ ] Fee handling
- [ ] AaveHandler
  - [ ] Lending/borrowing
  - [ ] Interest tracking
  - [ ] Collateral management
- [ ] CompoundHandler
  - [ ] Supply/Borrow detection
  - [ ] Interest tracking
  - [ ] cToken conversions

### 2.3 Transaction Processing
- [ ] TransactionNormalizers
  - [ ] Transfer standardization
  - [ ] Trade normalization
  - [ ] Fee normalization
- [ ] TransactionAggregator
  - [ ] Transaction combining
  - [ ] Chronological sorting
  - [ ] Multi-step transaction linking
- [ ] DataEnrichment
  - [ ] Transaction labeling
  - [ ] Position tracking
  - [ ] Address resolution

## Phase 3: Tax Calculator
- [ ] Cost basis tracking
- [ ] Gain/loss calculations
- [ ] Multiple disposal methods
  - [ ] FIFO implementation
  - [ ] LIFO implementation
- [ ] Fee handling
- [ ] Position PnL calculations
- [ ] Unit tests for calculations

## Phase 4: Report Generator
- [ ] CSV export formatting
- [ ] Transaction categorization
- [ ] Summary statistics
- [ ] Detailed trade logs
- [ ] Position reporting
- [ ] Unit tests for report generation

# Query Development

## Phase 1: Core Ethereum Queries

### 1.1 Balance Queries
- [ ] ETH Balance
  - Current balance
  - Historical balance
  - Balance at specific block
  - Multi-address support
- [ ] Token Balances
  - ERC20 token balances
  - Historical token balances
  - Balance aggregation
  - Token metadata

### 1.2 Transaction Queries
- [ ] Basic Transactions
  - Transaction details
  - Transaction status
  - Gas usage and costs
  - Block information
- [ ] Transaction History
  - Date range filtering
  - Address filtering
  - Transaction types
  - Pagination support

### 1.3 Transfer Queries
- [ ] ETH Transfers
  - Native ETH movements
  - Value tracking
  - Sender/receiver details
- [ ] Token Transfers
  - ERC20 transfers
  - Token contract details
  - Transfer amounts
  - USD value at time of transfer

### 1.4 Smart Contract Interaction Queries
- [ ] Internal Calls
  - Contract-to-contract calls
  - Call depth tracking
  - Method signatures
  - Call success/failure
- [ ] External Calls
  - User-initiated calls
  - Contract interactions
  - Input data parsing
  - Call classification

### 1.5 Query Optimization
- [ ] Performance tuning
  - Query complexity analysis
  - Response size optimization
  - Caching strategies
- [ ] Error handling
  - Rate limit management
  - Retry logic
  - Error recovery
- [ ] Pagination implementation
  - Cursor-based pagination
  - Block height ordering
  - Result consistency

### 1.6 Query Testing
- [ ] Unit tests
  - Individual query validation
  - Edge cases
  - Response format
- [ ] Integration tests
  - Multi-query scenarios
  - Data consistency
  - Rate limit compliance
- [ ] Performance tests
  - Response time
  - Data accuracy
  - Resource usage

## Phase 2: PriceFeed Implementation

### 2.1 Core Price Queries
- [ ] Current Price Data
  - Multiple DEX support
  - Liquidity validation
  - Price aggregation logic
  - Volume weighting
  - Outlier detection

### 2.2 Historical Price Data
- [ ] Historical Price Queries
  - Specific timestamps
  - Block number mapping
  - Price ranges
  - TWAP calculations
  - VWAP calculations

### 2.3 Price Caching System
- [ ] Cache Implementation
  - In-memory caching
  - Persistent storage
  - Cache invalidation rules
  - TTL management
  - Cache warming strategies

### 2.4 Price Aggregation
- [ ] Multi-Source Aggregation
  - DEX price aggregation
  - CEX price integration
  - Oracle price feeds
  - Confidence scoring
  - Price consensus logic

### 2.5 Price Feed Optimization
- [ ] Performance
  - Batch price fetching
  - Query optimization
  - Response time improvements
  - Memory usage optimization
- [ ] Reliability
  - Fallback sources
  - Error handling
  - Rate limiting
  - Circuit breakers
  - Data validation

### 2.6 Price Feed Testing
- [ ] Unit Testing
  - Price calculation accuracy
  - Cache behavior
  - Error scenarios
  - Edge cases
- [ ] Integration Testing
  - Multi-source consistency
  - Historical data accuracy
  - Cache performance
  - System resilience

## Phase 3: Protocol-Specific Queries

### 3.1 GMX Protocol
- [ ] Position Tracking
  - Open positions
  - Position modifications
  - Liquidations
  - PnL calculation
- [ ] Fee Analysis
  - Execution fees
  - Funding rates
  - Liquidation fees

### 3.2 Pendle Protocol
- [ ] Yield Positions
  - SY tokens
  - Market positions
  - Yield tracking
- [ ] LP Management
  - Position entry/exit
  - Rewards tracking
  - Fee collection

### 3.3 Supporting Protocols
- [ ] Uniswap
  - V2/V3 swaps
  - LP positions
  - Fee tiers
- [ ] Aave/Compound
  - Lending positions
  - Borrowing activity
  - Interest accrual

## Testing Strategy

### Unit Tests
- [ ] Individual component testing
- [ ] Mock responses
- [ ] Edge cases
- [ ] Error handling

### Protocol-Specific Tests
- [ ] GMX position lifecycle
- [ ] Pendle yield tracking
- [ ] Complex transaction scenarios
- [ ] Position tracking accuracy

### Integration Tests
- [ ] Component interactions
- [ ] Multi-protocol scenarios
- [ ] Error handling
- [ ] Performance testing

### End-to-End Tests
- [ ] Complete workflow testing
- [ ] Real transaction processing
- [ ] Report generation validation

## Documentation
- [ ] API documentation
- [ ] Protocol integration guides
- [ ] Configuration guide
- [ ] Deployment guide
- [ ] Contributing guidelines

## Future Enhancements
- [ ] Support for additional protocols
- [ ] Enhanced reporting formats
- [ ] Performance optimizations
- [ ] User interface
- [ ] API endpoints for external integration

## Development Process
1. **Research**
   - Study protocol contracts
   - Identify key events
   - Map data requirements

2. **Development**
   - Write initial queries
   - Test in playground
   - Document responses

3. **Testing**
   - Validate with real data
   - Check edge cases
   - Performance testing

4. **Integration**
   - Implement in codebase
   - Write tests
   - Document usage

## Notes
- Priority is given to accuracy and reliability
- Each component should be thoroughly tested before integration
- Documentation should be maintained alongside development
- Regular code reviews and testing are essential
- Focus on query accuracy first
- Consider rate limits in design
- Document all assumptions
- Test with real transactions
- Maintain query compatibility

## License

ISC 