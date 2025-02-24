# TaxSeason v2 Component Map

## Core Infrastructure

### BitqueryAPI Module
```mermaid
graph TD
    A[BitqueryAPI Client] --> B[OAuth2 Manager]
    A --> C[Query Builder]
    A --> D[Response Parser]
    
    B --> E[Token Manager]
    B --> F[Error Handler]
    
    C --> G[GraphQL Queries]
    D --> H[Data Validators]
    
    subgraph Error Handling
        F --> I[Retry Mechanism]
        F --> J[Rate Limiter]
    end
```

### PriceFeed Module
```mermaid
graph TD
    A[PriceFeed Service] --> B[Price Fetcher]
    A --> C[Cache Manager]
    
    B --> D[Current Prices]
    B --> E[Historical Prices]
    B --> F[Batch Queries]
    
    C --> G[File Cache]
    C --> H[Memory Cache]
    
    subgraph Normalization
        I[Price Normalizer]
        J[Volume Weighting]
        K[Outlier Detection]
    end
    
    B --> I
    I --> J
    J --> K
```

## Transaction Processing

### Transaction Manager
```mermaid
graph TD
    A[Transaction Manager] --> B[Base Fetchers]
    A --> C[Protocol Handlers]
    A --> D[Transaction Processor]
    
    B --> E[ETH Transfers]
    B --> F[Token Transfers]
    
    C --> G[GMX Handler]
    C --> H[Pendle Handler]
    C --> I[Uniswap Handler]
    C --> J[Aave Handler]
    C --> K[Compound Handler]
    
    D --> L[Normalizer]
    D --> M[Aggregator]
    D --> N[Enricher]
```

## Tax Calculation Engine

### Core Calculator
```mermaid
graph TD
    A[Tax Calculator] --> B[Cost Basis Tracker]
    A --> C[Disposal Methods]
    A --> D[PnL Calculator]
    
    C --> E[FIFO Implementation]
    C --> F[LIFO Implementation]
    
    D --> G[Position Tracker]
    D --> H[Fee Handler]
```

## Report Generation

### Report Engine
```mermaid
graph TD
    A[Report Generator] --> B[CSV Formatter]
    A --> C[Transaction Reporter]
    A --> D[Summary Generator]
    
    B --> E[Data Export]
    C --> F[Position Reports]
    D --> G[Statistics]
```

## Data Flow Overview
```mermaid
graph LR
    A[BitqueryAPI] --> B[PriceFeed]
    B --> C[Transaction Manager]
    C --> D[Tax Calculator]
    D --> E[Report Generator]
    
    subgraph External Data
        F[Blockchain Data]
        G[Price Data]
    end
    
    F --> A
    G --> B
```

## Component Dependencies

### Core Dependencies
- BitqueryAPI Module
  - OAuth2 Client
  - GraphQL Client
  - Rate Limiting
  - Error Handling

### Processing Dependencies
- Transaction Manager
  - Protocol-specific Handlers
  - Transfer Trackers
  - Position Managers

### Calculation Dependencies
- Tax Calculator
  - Cost Basis Engine
  - PnL Calculator
  - Fee Handler

### Output Dependencies
- Report Generator
  - Data Formatters
  - Export Handlers
  - Summary Generators

## Testing Components

### Test Structure
- Unit Tests
  - Component-level Testing
  - Mock Data Handlers
  - Validation Suites
- Integration Tests
  - Cross-module Testing
  - Protocol Integration
  - Data Flow Validation
- End-to-end Tests
  - Complete Workflow
  - Real Data Processing
  - Performance Metrics
