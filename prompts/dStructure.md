# TaxSeason v2 Structure

## Directory Tree
```
.
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── README.md                # Project overview ✅
├── dev_roadmap.md           # Development documentation ✅
├── babel.config.js          # Babel configuration
├── jest.config.js           # Jest configuration
├── package-lock.json        # Locked dependencies
├── package.json             # Project configuration
├── tsconfig.json            # TypeScript configuration
└── src/
    ├── core/               # Core functionality modules
    │   ├── api/           # API integration (80% complete)
    │   │   ├── BitqueryAPI.ts              # Base client ✅
    │   │   ├── QueryBuilder.ts             # Query utilities 🚧
    │   │   ├── ResponseParser.ts           # Response handling 🚧
    │   │   ├── types/                      # Type definitions
    │   │   │   ├── requests.ts
    │   │   │   └── responses.ts
    │   │   └── utils/                      # API utilities
    │   │       ├── auth.ts                 # Authentication ✅
    │   │       ├── error.ts                # Error handling ✅
    │   │       └── retry.ts                # Retry logic ✅
    │   │
    │   └── price/         # Price tracking (40% complete)
    │       ├── PriceFeed.ts                # Main service 🚧
    │       ├── cache/                      # Caching system 🚧
    │       │   ├── FileCache.ts
    │       │   └── MemoryCache.ts
    │       └── normalizers/                # Price normalization 🚧
    │           ├── outliers.ts
    │           └── volume.ts
    │
    ├── queries/           # Query implementations
    │   ├── core/         # Core query functionality 🚧
    │   │   ├── balance.ts
    │   │   ├── transaction.ts
    │   │   └── transfer.ts
    │   │
    │   └── protocols/    # Protocol-specific queries
    │       ├── aave/     # Lending protocol ⏳
    │       ├── compound/ # Lending protocol ⏳
    │       ├── gmx/      # Perpetuals protocol ⏳
    │       ├── pendle/   # Yield protocol ⏳
    │       └── uniswap/  # DEX protocol ⏳
    │
    ├── transactions/     # Transaction processing
    │   ├── fetchers/    # Base transaction fetchers 🚧
    │   │   ├── BaseFetcher.ts
    │   │   ├── EthFetcher.ts
    │   │   └── TokenFetcher.ts
    │   │
    │   ├── processors/  # Transaction processing ⏳
    │   │   ├── Normalizer.ts
    │   │   ├── Aggregator.ts
    │   │   └── Enricher.ts
    │   │
    │   └── protocols/   # Protocol handlers ⏳
    │       ├── BaseHandler.ts
    │       ├── GMXHandler.ts
    │       ├── PendleHandler.ts
    │       └── UniswapHandler.ts
    │
    ├── tax/            # Tax calculations ⏳
    │   ├── calculator/
    │   │   ├── CostBasis.ts
    │   │   └── PnL.ts
    │   ├── methods/
    │   │   ├── FIFO.ts
    │   │   └── LIFO.ts
    │   └── positions/
    │       └── PositionTracker.ts
    │
    ├── reports/        # Report generation ⏳
    │   ├── formatters/
    │   │   ├── CSV.ts
    │   │   └── JSON.ts
    │   ├── templates/
    │   │   ├── Summary.ts
    │   │   └── Detailed.ts
    │   └── generators/
    │       ├── TransactionReport.ts
    │       └── PositionReport.ts
    │
    ├── tests/          # Test suites
    │   ├── core/
    │   │   ├── api/    # API tests (60% coverage)
    │   │   │   └── BitqueryAPI.test.ts
    │   │   └── price/  # Price feed tests (20% coverage)
    │   │       └── PriceFeed.test.ts
    │   │
    │   ├── queries/    # Query tests ⏳
    │   ├── tax/        # Tax calculation tests ⏳
    │   └── e2e/        # End-to-end tests ⏳
    │
    └── utils/          # Shared utilities
        ├── constants.ts     # Global constants
        ├── errors.ts        # Error definitions
        ├── logger.ts        # Logging utility
        └── validation.ts    # Data validation

```

## Status Indicators
- ✅ Complete
- 🚧 In Progress
- ⏳ Planned/Not Started

## Directory Descriptions

### Root Files
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore rules
- `README.md` - Project overview and setup instructions
- `DEVELOPMENT.md` - Project documentation and roadmap
- `babel.config.js` - Babel configuration for modern JavaScript
- `jest.config.js` - Jest test framework configuration
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration

### Source Code (`src/`)

#### Core Components
- `core/` - Core functionality modules
  - `api/` (80% complete) - Bitquery API integration
    - Base client implementation ✅
    - Query builder utilities 🚧
    - Response parsing 🚧
    - Authentication and error handling ✅
  - `price/` (40% complete) - Price tracking system
    - Price feed implementation 🚧
    - Caching system 🚧
    - Price normalization 🚧

#### Query System
- `queries/` - Query implementations
  - `core/` - Core query functionality 🚧
  - `protocols/` - Protocol-specific queries ⏳

#### Transaction Processing
- `transactions/` - Transaction management
  - `fetchers/` - Base transaction fetchers 🚧
  - `processors/` - Transaction processing ⏳
  - `protocols/` - Protocol-specific handlers ⏳

#### Business Logic
- `tax/` - Tax calculation implementation ⏳
- `reports/` - Report generation functionality ⏳

#### Testing
- `tests/` - Test suites
  - `core/api/` - API tests (60% coverage)
  - `core/price/` - Price feed tests (20% coverage)
  - Other test suites planned ⏳

#### Utilities
- `utils/` - Shared utilities
  - Common utilities and helpers
  - Logging and validation

## Implementation Progress
- Core API Module: 80%
- Price Feed Module: 40%
- Transaction Processing: 20%
- Protocol Handlers: 0%
- Tax Calculations: 0%
- Report Generation: 0%
- Test Coverage: ~40%

Total: 35 directories, 45 files (planned)
