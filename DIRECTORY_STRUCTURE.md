# TaxSeason v2 Structure

```
.
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── DEVELOPMENT.md        # Project documentation
├── DIRECTORY_STRUCTURE.md
├── babel.config.js       # Babel configuration
├── jest.config.js        # Jest configuration
├── package-lock.json     # Locked dependencies
├── package.json          # Project configuration
└── src
    ├── core
    │   ├── api
    │   │   └── BitqueryAPI.js
    │   └── price
    │       └── PriceFeed.js
    ├── queries
    │   ├── core
    │   └── protocols
    │       ├── aave
    │       ├── compound
    │       ├── gmx
    │       ├── pendle
    │       └── uniswap
    ├── reports
    ├── tax
    ├── tests
    │   └── core
    │       └── api
    │           └── BitqueryAPI.test.js
    ├── transactions
    │   ├── fetchers
    │   └── protocols
    └── utils
        ├── constants.js
        └── errors.js
```

## Directory Descriptions

### Root Files
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore rules
- `DEVELOPMENT.md` - Project documentation and roadmap
- `babel.config.js` - Babel configuration for modern JavaScript
- `jest.config.js` - Jest test framework configuration
- `package.json` - Project dependencies and scripts

### Source Code (`src/`)

#### Core Components
- `core/` - Core functionality modules
  - `api/BitqueryAPI.js` - Bitquery API client implementation
  - `price/PriceFeed.js` - Price tracking and caching system

#### Query System
- `queries/` - Query implementations
  - `core/` - Core query functionality
  - `protocols/` - Protocol-specific queries:
    - `aave/` - Aave lending protocol
    - `compound/` - Compound finance
    - `gmx/` - GMX perpetuals
    - `pendle/` - Pendle yield
    - `uniswap/` - Uniswap DEX

#### Transaction Processing
- `transactions/` - Transaction management
  - `fetchers/` - Base transaction fetchers
  - `protocols/` - Protocol-specific handlers

#### Business Logic
- `tax/` - Tax calculation implementation
- `reports/` - Report generation functionality

#### Testing
- `tests/` - Test suites
  - Currently includes API tests (`BitqueryAPI.test.js`)

#### Utilities
- `utils/` - Shared utilities
  - `constants.js` - Global constants
  - `errors.js` - Error definitions

Total: 22 directories, 13 files
