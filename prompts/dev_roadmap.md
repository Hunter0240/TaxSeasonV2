# TaxSeason v2

A comprehensive cryptocurrency tax calculation and reporting tool, focused on accurate tracking of DeFi transactions and positions.

## Quick Start

### Development Commands
- `npm start` - Run the application
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run linter
- `npm run debug` - Run with debugger

### Environment Variables
- `BITQUERY_CLIENT_ID` - Your Bitquery OAuth2 client ID
- `BITQUERY_CLIENT_SECRET` - Your Bitquery OAuth2 client secret
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level
- `PRICE_CACHE_TTL` - Cache TTL in milliseconds
- `MAX_RETRIES` - Maximum API retry attempts (default: 3)
- `RETRY_DELAY` - Delay between retries in milliseconds (default: 1000)

## Project Status

Current Phase: 1 - Core Infrastructure

### Completed ✅
- Project setup and configuration
- Base API client implementation
- OAuth2 authentication
- Token management
- Basic error handling and retry mechanism
- Initial unit tests for API client

### In Progress 🚧
- Query builder utilities
- Response parsing and validation
- Price feed implementation
- Caching system

## Development Roadmap

### Phase 1: Core Infrastructure
- BitqueryAPI Module
  - Query builder utilities
  - Response parsing and validation
  - Complete test coverage
- PriceFeed Module
  - Current and historical price queries
  - Caching system
  - Price normalization
  - Unit tests

### Phase 2: Transaction Processing
- Base Transaction Fetchers
  - ETH and token transfers
  - Transaction metadata
  - Smart contract interactions
- Protocol Handlers
  - GMX: Position tracking, PnL calculations
  - Pendle: Yield tokens, LP positions
  - Uniswap: Swaps, liquidity positions
  - Aave/Compound: Lending/borrowing
- Transaction Processing
  - Normalization and aggregation
  - Position tracking
  - Data enrichment

### Phase 3: Tax Calculations
- Cost basis tracking
- Gain/loss calculations (FIFO/LIFO)
- Fee handling
- Position PnL calculations
- Comprehensive testing suite

### Phase 4: Reporting
- CSV export formatting
- Transaction categorization
- Summary statistics
- Position reporting
- Test coverage

## Query Implementation

### Core Queries
- Balance queries (ETH/Tokens)
- Transaction history
- Transfer tracking
- Smart contract interactions
- Price data (Current/Historical)

### Protocol-Specific Queries
- GMX position tracking
- Pendle yield positions
- Uniswap liquidity
- Lending protocol activities

### Query Optimization
- Performance tuning
- Caching strategies
- Error handling
- Pagination
- Rate limiting

## Testing Strategy
- Unit tests for each component
- Integration tests for protocol interactions
- End-to-end workflow testing
- Performance benchmarking

## Contributing
1. Pick an unassigned task from the roadmap
2. Create a feature branch
3. Write tests first
4. Implement the feature
5. Submit a pull request

## License
ISC 