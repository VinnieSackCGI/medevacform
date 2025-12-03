# MEDEVAC POC Azure Environment Model

## Architecture Overview

```mermaid
graph TB
    %% External Users
    User[👤 State Department Users]
    
    %% Frontend Layer
    SWA[🌐 Static Web App<br/>swa-medevac-poc<br/>Free Tier<br/>https://nice-coast-0236d0b0f.3.azurestaticapps.net]
    
    %% Backend Layer
    Functions[⚡ Azure Functions<br/>func-medevac-poc<br/>Consumption Plan<br/>Node.js 20 Runtime]
    
    %% Storage Layer
    Storage[💾 Storage Account<br/>medevaciafstorage<br/>Hot Tier, GRS]
    
    %% Storage Containers
    AppData[📦 application-data<br/>Country Locations JSON<br/>1,081 records]
    PerDiem[📦 perdiem-cache<br/>Cached per diem rates]
    RateHistory[📦 rate-history<br/>Historical rate data]
    ScraperLogs[📦 scraper-logs<br/>Scraping operation logs]
    
    %% Monitoring
    AppInsights[📊 Application Insights<br/>func-medevac-poc<br/>Monitoring & Telemetry]
    
    %% Security (Currently unused but created)
    KeyVault[🔐 Key Vault<br/>kv-medevac-poc473<br/>Secrets Management<br/>⚠️ Permission Restricted]
    
    %% Data Flow
    User -->|HTTPS Requests| SWA
    SWA -->|API Calls| Functions
    Functions -->|Read/Write Data| Storage
    Functions -->|Telemetry| AppInsights
    
    %% Storage Structure
    Storage --> AppData
    Storage --> PerDiem
    Storage --> RateHistory
    Storage --> ScraperLogs
    
    %% Configuration
    Functions -.->|Connection String<br/>Direct Access| Storage
    Functions -.->|Would Use<br/>(If Permissions)| KeyVault
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef storage fill:#e8f5e8
    classDef security fill:#fff3e0
    classDef monitoring fill:#fce4ec
    classDef warning fill:#ffebee
    
    class SWA frontend
    class Functions backend
    class Storage,AppData,PerDiem,RateHistory,ScraperLogs storage
    class KeyVault security
    class AppInsights monitoring
```

## Component Details

### 🌐 Frontend Layer: Static Web App
- **Resource**: `swa-medevac-poc`
- **Tier**: Free (0$/month)
- **Location**: East US 2
- **Purpose**: Hosts React.js MEDEVAC form application
- **Features**:
  - Global CDN distribution
  - HTTPS by default
  - Custom domain support
  - Staging environments

**How it works**: Serves the React application to users' browsers, handles client-side routing, and makes API calls to Azure Functions.

### ⚡ Backend Layer: Azure Functions
- **Resource**: `func-medevac-poc`
- **Plan**: Consumption (pay-per-execution)
- **Runtime**: Node.js 20
- **Location**: East US
- **Purpose**: Serverless API for MEDEVAC operations

**Functions Architecture**:
```
/api/
├── locations          # GET country/location data
├── perdiem           # GET/POST per diem rates
├── medevac-form      # POST form submissions  
├── scraper           # POST trigger scraping operations
└── health            # GET health check
```

**How it works**: Executes on-demand when called by the frontend, scales automatically based on load, only charges for actual execution time.

### 💾 Storage Layer: Blob Storage
- **Resource**: `medevaciafstorage`
- **Tier**: Hot (optimized for frequent access)
- **Redundancy**: GRS (Geo-Redundant Storage)
- **Location**: East US with geo-replication

**Container Structure**:
```
medevaciafstorage/
├── application-data/
│   ├── country-locations.json     # 1,081 location records (646KB)
│   ├── reference-data-index.json  # Dataset catalog
│   └── form-submissions/          # Future: submitted forms
├── perdiem-cache/
│   ├── rates-2025.json           # Current year rates
│   └── rates-archive/            # Historical rates by year
├── rate-history/
│   └── daily-snapshots/          # Daily rate captures
└── scraper-logs/
    └── operation-logs/           # Scraping activity logs
```

**How it works**: Provides persistent storage for application data, form submissions, and operational logs with high availability and automatic backup.

## Data Flow Scenarios

### 1. 📋 Form Loading Process
```
User Browser → Static Web App → Functions API (/api/locations) → Blob Storage (application-data) → Country Locations JSON
```

1. User opens MEDEVAC form
2. React app requests location data from `/api/locations`
3. Azure Function reads `country-locations.json` from blob storage
4. Data returned to frontend for dropdown population

### 2. 💰 Per Diem Calculation
```
Form Input → Functions API (/api/perdiem) → Blob Storage (perdiem-cache) → Rate Calculation → Response
```

1. User selects location and dates
2. Frontend calls `/api/perdiem` with parameters
3. Function checks cache for rates
4. If not cached, may trigger scraping operation
5. Calculated per diem returned to form

### 3. 📤 Form Submission
```
Completed Form → Functions API (/api/medevac-form) → Blob Storage (application-data/submissions) → Confirmation
```

1. User submits completed MEDEVAC form
2. Function validates and processes data
3. Form saved to blob storage with unique ID
4. Confirmation returned to user

### 4. 🔍 Rate Scraping (Background)
```
Timer Trigger → Functions → External APIs → Blob Storage (perdiem-cache + rate-history) → Logs
```

1. Scheduled function triggers rate updates
2. Scrapes current rates from external sources
3. Updates cache and maintains historical data
4. Logs operations for monitoring

## Security & Configuration

### 🔐 Current Security Model
- **Authentication**: Direct storage connection strings (POC approach)
- **CORS**: Configured to allow Static Web App domain
- **HTTPS**: Enforced on all endpoints
- **Key Vault**: Created but not used (permission restrictions)

### ⚙️ Configuration Settings
```json
{
  "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;AccountName=medevaciafstorage;...",
  "CORS_ORIGIN": "https://nice-coast-0236d0b0f.3.azurestaticapps.net",
  "FUNCTIONS_WORKER_RUNTIME": "node",
  "FUNCTIONS_EXTENSION_VERSION": "~4"
}
```

## Monitoring & Observability

### 📊 Application Insights Integration
- **Automatic**: Created with Functions app
- **Telemetry**: Request tracking, performance metrics, error logging
- **Dashboards**: Available in Azure Portal
- **Alerts**: Can be configured for failures or performance issues

### 📈 Key Metrics Tracked
- Function execution times
- Request success/failure rates
- Storage operation latencies
- User engagement patterns
- Error rates and exceptions

## Scalability & Performance

### 🚀 Auto-Scaling Behavior
- **Static Web App**: Global CDN, instant scaling
- **Azure Functions**: Auto-scales based on demand (0-200+ instances)
- **Blob Storage**: Handles high throughput automatically

### ⚡ Performance Characteristics
- **Cold Start**: ~2-3 seconds for first function execution
- **Warm Execution**: ~50-200ms response times
- **Storage Access**: ~10-50ms for blob operations
- **Global Distribution**: CDN reduces latency worldwide

## Cost Breakdown (Monthly)

| Component | Tier | Estimated Cost |
|-----------|------|---------------|
| Static Web App | Free | $0 |
| Azure Functions | Consumption | $0-5 |
| Storage Account | Hot/GRS | $2-3 |
| Application Insights | Basic | $2-5 |
| Key Vault | Standard | $1 (if used) |
| **Total** | | **$5-14/month** |

## Deployment Status
- ✅ All infrastructure deployed
- ✅ Storage populated with location data
- ✅ Configuration applied
- ⏳ Application code deployment pending
- ⏳ Testing and validation pending

## Next Steps for Full Operation
1. Deploy React frontend to Static Web App
2. Deploy serverless functions to Azure Functions
3. Configure CI/CD pipeline
4. Implement comprehensive monitoring
5. Security hardening (move to Key Vault when permissions resolved)

---

*This POC architecture provides a solid foundation for the MEDEVAC application with excellent cost efficiency and scalability characteristics.*