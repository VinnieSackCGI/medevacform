# MEDEVAC System Data Flow Diagram

This diagram shows how data flows through the MEDEVAC form system and how calculations are performed to replicate Excel tracker functionality.

## Data Flow Diagram

```mermaid
flowchart TD
    %% Input Sources
    UI[User Interface Inputs] 
    REF[Reference Data<br/>Post/Region Lookup]
    
    %% Core State
    STATE[React State<br/>formData Object]
    
    %% Business Logic Layer
    BL[Business Logic<br/>Calculations Engine]
    
    %% Calculation Functions
    CALC1[generateObligationNumber]
    CALC2[calculateMEDEVACStatus]
    CALC3[calculateCableStatus]
    CALC4[calculateTotalObligation]
    CALC5[calculateEffectiveDates]
    CALC6[getRegionFromPost]
    CALC7[calculateExtensionDuration]
    CALC8[calculateEmployeeResponseTime]
    
    %% Data Storage
    LOCAL[Local Storage<br/>Submissions]
    
    %% Display Components
    DISPLAY[Status Display<br/>Components]
    SUMMARY[Financial Summary<br/>Components]
    TRACKING[Cable Tracking<br/>Display]
    
    %% Data Flow
    UI -->|User Input| STATE
    REF -->|Post Selection| STATE
    
    STATE -->|Form Data Changes| BL
    
    BL --> CALC1
    BL --> CALC2
    BL --> CALC3
    BL --> CALC4
    BL --> CALC5
    BL --> CALC6
    BL --> CALC7
    BL --> CALC8
    
    %% Calculation Results Flow Back
    CALC1 -->|Obligation Number| STATE
    CALC2 -->|Status Updates| STATE
    CALC3 -->|Cable Status| STATE
    CALC4 -->|Financial Totals| STATE
    CALC5 -->|Effective Dates| STATE
    CALC6 -->|Region Assignment| STATE
    CALC7 -->|Duration Calcs| STATE
    CALC8 -->|Response Times| STATE
    
    %% Output to Components
    STATE -->|Calculated Values| DISPLAY
    STATE -->|Financial Data| SUMMARY
    STATE -->|Cable Status| TRACKING
    
    %% Persistence
    STATE -->|Form Submission| LOCAL
    
    %% Styling
    classDef input fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef calc fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef output fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class UI,REF input
    class STATE,BL process
    class CALC1,CALC2,CALC3,CALC4,CALC5,CALC6,CALC7,CALC8 calc
    class DISPLAY,SUMMARY,TRACKING output
    class LOCAL storage
```

## Detailed Data Flow Process

### 1. Input Layer
```mermaid
flowchart LR
    A[Basic Information Form] -->|Patient Name, Agency Type| STATE
    B[Initial Funding Form] -->|Dates, Per Diem Rates| STATE
    C[Amendment Section] -->|Modified Values| STATE
    D[Extensions Manager] -->|E1-E10 Data| STATE
    E[Post Selector] -->|Home Post Selection| STATE
    
    STATE[formData State Object]
    
    classDef input fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef state fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class A,B,C,D,E input
    class STATE state
```

### 2. Calculation Engine Flow
```mermaid
flowchart TD
    START[Form Data Change Detected<br/>useEffect Trigger]
    
    START --> CHECK{Has Required Data?}
    CHECK -->|No| SKIP[Skip Calculations]
    CHECK -->|Yes| CALC[Run Calculations]
    
    CALC --> OBL[Generate Obligation Number<br/>Format: YY + Agency Code + XXX]
    CALC --> STATUS[Calculate MEDEVAC Status<br/>Based on Latest Funding Stage]
    CALC --> CABLE[Calculate Cable Status<br/>Processing Time or 'Sent']
    CALC --> TOTAL[Calculate Total Obligation<br/>Sum All Funding Sources]
    CALC --> DATES[Calculate Effective Dates<br/>Latest Start/End Across Sources]
    CALC --> REGION[Lookup Region from Post<br/>VLOOKUP Equivalent]
    CALC --> DURATION[Calculate Extension Duration<br/>Total Additional Days]
    
    OBL --> UPDATE[Update State with<br/>Calculated Values]
    STATUS --> UPDATE
    CABLE --> UPDATE
    TOTAL --> UPDATE
    DATES --> UPDATE
    REGION --> UPDATE
    DURATION --> UPDATE
    
    UPDATE --> RENDER[Re-render Components<br/>with New Values]
    
    classDef start fill:#c8e6c9,stroke:#388e3c,stroke-width:3px
    classDef decision fill:#fff9c4,stroke:#f9a825,stroke-width:2px
    classDef process fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef update fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    
    class START start
    class CHECK decision
    class OBL,STATUS,CABLE,TOTAL,DATES,REGION,DURATION process
    class UPDATE,RENDER update
```

### 3. Financial Calculation Flow
```mermaid
flowchart TD
    FUNDING[Funding Data Input]
    
    FUNDING --> INITIAL[Initial Funding<br/>Per Diem + Airfare + Misc]
    FUNDING --> AMEND[Amendment Funding<br/>Modified Amounts]
    FUNDING --> EXT[Extension Funding<br/>E1-E10 Totals]
    
    INITIAL --> PD1[Per Diem Calculation<br/>Rate1×Days1 + Rate2×Days2<br/>+ Rate3×Days3 + Rate4×Days4]
    AMEND --> PD2[Amendment Per Diem<br/>Same Structure as Initial]
    EXT --> PD3[Extension Per Diems<br/>Individual Calculations Each]
    
    PD1 --> IT[Initial Total<br/>Per Diem + Airfare + Add'l Travelers + Misc]
    PD2 --> AT[Amendment Total<br/>Per Diem + Airfare + Add'l Travelers + Misc]
    PD3 --> ET[Extension Totals<br/>Sum of All E1-E10]
    
    IT --> GRAND[Grand Total Obligation<br/>Initial + Amendment + Extensions]
    AT --> GRAND
    ET --> GRAND
    
    GRAND --> DISPLAY[Financial Summary Display<br/>Breakdown + Grand Total]
    
    classDef input fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef calc fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef total fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef output fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class FUNDING input
    class INITIAL,AMEND,EXT,PD1,PD2,PD3 calc
    class IT,AT,ET,GRAND total
    class DISPLAY output
```

### 4. Status Calculation Logic
```mermaid
flowchart TD
    START[Calculate MEDEVAC Status]
    
    START --> CHK_EXT{Has Extensions?}
    CHK_EXT -->|Yes| LATEST_EXT[Get Latest Extension<br/>E10, E9, E8... E1]
    CHK_EXT -->|No| CHK_AMEND{Has Amendment?}
    
    LATEST_EXT --> EXT_OUT{Cable Out Date?}
    EXT_OUT -->|Yes| STATUS_EXT_OUT[Extension X Funding Out]
    EXT_OUT -->|No| EXT_IN{Cable In Date?}
    EXT_IN -->|Yes| STATUS_EXT_PROC[Extension X In Processing]
    EXT_IN -->|No| CHK_AMEND
    
    CHK_AMEND -->|Yes| AMEND_OUT{Amendment Cable Out?}
    CHK_AMEND -->|No| CHK_INITIAL
    
    AMEND_OUT -->|Yes| STATUS_AMEND_OUT[Amendment Funding Out]
    AMEND_OUT -->|No| AMEND_IN{Amendment Cable In?}
    AMEND_IN -->|Yes| STATUS_AMEND_PROC[Amendment In Processing]
    AMEND_IN -->|No| CHK_INITIAL
    
    CHK_INITIAL --> INIT_OUT{Initial Cable Out?}
    INIT_OUT -->|Yes| STATUS_INIT_OUT[Initial Funding Out]
    INIT_OUT -->|No| INIT_IN{Initial Cable In?}
    INIT_IN -->|Yes| STATUS_INIT_PROC[Initial In Processing]
    INIT_IN -->|No| STATUS_INITIATED[Initiated]
    
    STATUS_EXT_OUT --> RETURN[Return Status]
    STATUS_EXT_PROC --> RETURN
    STATUS_AMEND_OUT --> RETURN
    STATUS_AMEND_PROC --> RETURN
    STATUS_INIT_OUT --> RETURN
    STATUS_INIT_PROC --> RETURN
    STATUS_INITIATED --> RETURN
    
    classDef start fill:#c8e6c9,stroke:#388e3c,stroke-width:3px
    classDef decision fill:#fff9c4,stroke:#f9a825,stroke-width:2px
    classDef status fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef return fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class START start
    class CHK_EXT,CHK_AMEND,CHK_INITIAL,EXT_OUT,EXT_IN,AMEND_OUT,AMEND_IN,INIT_OUT,INIT_IN decision
    class STATUS_EXT_OUT,STATUS_EXT_PROC,STATUS_AMEND_OUT,STATUS_AMEND_PROC,STATUS_INIT_OUT,STATUS_INIT_PROC,STATUS_INITIATED status
    class RETURN return
```

## Data Flow Patterns

### Real-time Calculation Pattern
1. **User Input** → Form field change
2. **State Update** → formData modified via setFormData
3. **useEffect Trigger** → Dependency array detects change
4. **Calculation Execution** → Business logic functions run
5. **State Update** → Calculated values merged into formData
6. **Component Re-render** → UI displays updated values

### Excel Equivalency Pattern
The system replicates Excel's calculation model:
- **Immediate Updates**: Like Excel cells, changes trigger immediate recalculation
- **Dependency Chain**: Changes cascade through related calculations
- **VLOOKUP Simulation**: Post selection triggers region lookup
- **Formula Replication**: Status, totals, and dates calculated using Excel logic

### Error Handling Flow
```mermaid
flowchart LR
    INPUT[User Input] --> VALIDATE{Valid Data?}
    VALIDATE -->|Yes| CALCULATE[Run Calculations]
    VALIDATE -->|No| ERROR[Display Validation Error]
    CALCULATE --> SUCCESS{Calculation Success?}
    SUCCESS -->|Yes| UPDATE[Update State]
    SUCCESS -->|No| DEFAULT[Use Default Values]
    ERROR --> RETRY[Allow User Retry]
    DEFAULT --> UPDATE
    
    classDef input fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef decision fill:#fff9c4,stroke:#f9a825,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    
    class INPUT input
    class VALIDATE,SUCCESS decision
    class ERROR,DEFAULT error
    class CALCULATE,UPDATE,RETRY success
```

This data flow diagram illustrates how the MEDEVAC system processes user input, performs Excel-equivalent calculations, and maintains real-time updates across all components while ensuring data consistency and accuracy.