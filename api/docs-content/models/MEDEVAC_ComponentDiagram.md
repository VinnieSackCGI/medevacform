# MEDEVAC System Component Relationship Diagram

This diagram shows the React component hierarchy and relationships within the MEDEVAC form application.

## Component Hierarchy Diagram

```mermaid
flowchart TD
    %% Main App Structure
    APP[App.js<br/>Main Router & Layout]
    NAV[Navigation.js<br/>Header & Menu]
    
    %% Pages
    ENTRY[EntryForm.js<br/>Main Form Page]
    DB[DatabaseView.js<br/>Submissions List]
    POST[PostData.js<br/>Reference Data]
    INST[Instructions.js<br/>Help Content]
    
    %% Main Form Container
    ENHANCED[EnhancedMEDEVACForm.js<br/>Form State Manager<br/>& Section Controller]
    
    %% Form Sections
    BASIC[BasicInformation.js<br/>Patient & Case Info]
    FUNDING[InitialFunding.js<br/>Funding Container]
    AMEND[AmendmentSection.js<br/>A1 Amendment]
    EXT[ExtensionsSection.js<br/>E1-E10 Manager]
    COMP[CompletionSection.js<br/>Final Accounting]
    
    %% Basic Information Components
    STATUS[StatusDisplay.js<br/>Live Status & Totals]
    LOC[LocationFields.js<br/>Post & Region]
    
    %% Initial Funding Components
    CABLE[CableTracking.js<br/>Cable In/Out Dates]
    PERDIEM[PerDiemCalculator.js<br/>Rate Calculator]
    FINSUM[FinancialSummary.js<br/>Funding Overview]
    
    %% Extension Components
    EXTFORM[ExtensionForm<br/>Individual Extension<br/>(E1, E2, etc.)]
    
    %% UI Components
    CARD[Card Components<br/>CardHeader, CardContent]
    BUTTON[Button Components<br/>Primary, Secondary]
    INPUT[Input Components<br/>Text, Date, Number]
    LABEL[Label Components<br/>Form Labels]
    BADGE[Badge Components<br/>Status Indicators]
    
    %% Utility/Logic
    LOGIC[businessLogic.js<br/>Calculation Functions]
    
    %% Relationships
    APP --> NAV
    APP --> ENTRY
    APP --> DB
    APP --> POST
    APP --> INST
    
    ENTRY --> ENHANCED
    
    ENHANCED --> BASIC
    ENHANCED --> FUNDING
    ENHANCED --> AMEND
    ENHANCED --> EXT
    ENHANCED --> COMP
    
    BASIC --> STATUS
    BASIC --> LOC
    
    FUNDING --> CABLE
    FUNDING --> PERDIEM
    FUNDING --> FINSUM
    
    EXT --> EXTFORM
    
    %% UI Component Usage
    ENHANCED -.->|uses| CARD
    ENHANCED -.->|uses| BUTTON
    BASIC -.->|uses| INPUT
    BASIC -.->|uses| LABEL
    STATUS -.->|uses| BADGE
    FUNDING -.->|uses| CARD
    CABLE -.->|uses| INPUT
    PERDIEM -.->|uses| INPUT
    FINSUM -.->|uses| CARD
    AMEND -.->|uses| CARD
    AMEND -.->|uses| BUTTON
    EXT -.->|uses| CARD
    EXT -.->|uses| BUTTON
    EXTFORM -.->|uses| INPUT
    EXTFORM -.->|uses| LABEL
    COMP -.->|uses| CARD
    
    %% Business Logic Usage
    ENHANCED -.->|imports| LOGIC
    STATUS -.->|uses| LOGIC
    FINSUM -.->|uses| LOGIC
    
    %% Styling
    classDef app fill:#1a237e,color:#fff,stroke:#000,stroke-width:3px
    classDef page fill:#283593,color:#fff,stroke:#000,stroke-width:2px
    classDef main fill:#3949ab,color:#fff,stroke:#000,stroke-width:2px
    classDef section fill:#3f51b5,color:#fff,stroke:#000,stroke-width:2px
    classDef component fill:#5c6bc0,color:#fff,stroke:#000,stroke-width:1px
    classDef ui fill:#7986cb,color:#fff,stroke:#000,stroke-width:1px
    classDef utility fill:#9c27b0,color:#fff,stroke:#000,stroke-width:2px
    
    class APP app
    class NAV,ENTRY,DB,POST,INST page
    class ENHANCED main
    class BASIC,FUNDING,AMEND,EXT,COMP section
    class STATUS,LOC,CABLE,PERDIEM,FINSUM,EXTFORM component
    class CARD,BUTTON,INPUT,LABEL,BADGE ui
    class LOGIC utility
```

## Detailed Component Breakdown

### 1. Application Architecture
```mermaid
flowchart TD
    subgraph "Application Layer"
        APP[App.js<br/>React Router<br/>Global Layout]
        NAV[Navigation.js<br/>Header & Menu Bar]
    end
    
    subgraph "Page Layer"
        ENTRY[EntryForm.js]
        DB[DatabaseView.js]
        POST[PostData.js]
        INST[Instructions.js]
    end
    
    subgraph "Form Layer"
        ENHANCED[EnhancedMEDEVACForm.js<br/>State Management<br/>Section Navigation]
    end
    
    APP --> NAV
    APP --> ENTRY
    APP --> DB
    APP --> POST
    APP --> INST
    ENTRY --> ENHANCED
    
    classDef app fill:#1565c0,color:#fff,stroke:#000,stroke-width:2px
    classDef page fill:#1976d2,color:#fff,stroke:#000,stroke-width:2px
    classDef form fill:#1e88e5,color:#fff,stroke:#000,stroke-width:2px
    
    class APP,NAV app
    class ENTRY,DB,POST,INST page
    class ENHANCED form
```

### 2. Form Section Architecture
```mermaid
flowchart TD
    ENHANCED[EnhancedMEDEVACForm.js<br/>Central State: formData<br/>Section Controller]
    
    subgraph "Form Sections"
        BASIC[BasicInformation.js<br/>• Patient Name<br/>• Agency Type<br/>• MEDEVAC Type<br/>• Home Post]
        
        FUNDING[InitialFunding.js<br/>• Start/End Dates<br/>• Cable Tracking<br/>• Per Diem Rates<br/>• Financial Summary]
        
        AMEND[AmendmentSection.js<br/>• Amendment A1<br/>• Modified Dates<br/>• Additional Funding]
        
        EXT[ExtensionsSection.js<br/>• Extensions E1-E10<br/>• Dynamic Add/Remove<br/>• Individual Funding]
        
        COMP[CompletionSection.js<br/>• Final Accounting<br/>• Actual Dates<br/>• Comments]
    end
    
    ENHANCED -->|formData, setFormData| BASIC
    ENHANCED -->|formData, setFormData| FUNDING
    ENHANCED -->|formData, setFormData| AMEND
    ENHANCED -->|formData, setFormData| EXT
    ENHANCED -->|formData, setFormData| COMP
    
    classDef main fill:#2e7d32,color:#fff,stroke:#000,stroke-width:3px
    classDef section fill:#388e3c,color:#fff,stroke:#000,stroke-width:2px
    
    class ENHANCED main
    class BASIC,FUNDING,AMEND,EXT,COMP section
```

### 3. Component Data Flow
```mermaid
flowchart LR
    subgraph "State Management"
        STATE[formData State<br/>EnhancedMEDEVACForm]
        SETTER[setFormData<br/>State Updater]
    end
    
    subgraph "Child Components"
        INPUT1[BasicInformation]
        INPUT2[InitialFunding]
        INPUT3[AmendmentSection]
        INPUT4[ExtensionsSection]
    end
    
    subgraph "Business Logic"
        CALC[businessLogic.js<br/>Calculation Functions]
    end
    
    subgraph "Display Components"
        STATUS[StatusDisplay]
        SUMMARY[FinancialSummary]
    end
    
    STATE -->|props| INPUT1
    STATE -->|props| INPUT2
    STATE -->|props| INPUT3
    STATE -->|props| INPUT4
    
    INPUT1 -->|onChange| SETTER
    INPUT2 -->|onChange| SETTER
    INPUT3 -->|onChange| SETTER
    INPUT4 -->|onChange| SETTER
    
    SETTER --> STATE
    
    STATE -->|useEffect| CALC
    CALC -->|calculated values| STATE
    
    STATE -->|calculated props| STATUS
    STATE -->|calculated props| SUMMARY
    
    classDef state fill:#4a148c,color:#fff,stroke:#000,stroke-width:2px
    classDef input fill:#6a1b9a,color:#fff,stroke:#000,stroke-width:2px
    classDef logic fill:#8e24aa,color:#fff,stroke:#000,stroke-width:2px
    classDef display fill:#ab47bc,color:#fff,stroke:#000,stroke-width:2px
    
    class STATE,SETTER state
    class INPUT1,INPUT2,INPUT3,INPUT4 input
    class CALC logic
    class STATUS,SUMMARY display
```

### 4. Extension Management Architecture
```mermaid
flowchart TD
    EXT_MANAGER[ExtensionsSection.js<br/>Extensions Manager]
    
    subgraph "Extension Controls"
        ADD_BTN[Add Extension Button<br/>Max 10 Extensions]
        COUNTER[Extension Counter<br/>E1, E2, E3... E10]
    end
    
    subgraph "Dynamic Extension Forms"
        E1[ExtensionForm - E1<br/>Individual Form Instance]
        E2[ExtensionForm - E2<br/>Individual Form Instance]
        E3[ExtensionForm - E3<br/>Individual Form Instance]
        EN[ExtensionForm - EN<br/>Up to E10]
    end
    
    subgraph "Extension Actions"
        UPDATE[updateExtension<br/>Modify Individual Extension]
        REMOVE[removeExtension<br/>Delete & Renumber]
        CALC_TOTAL[calculateExtensionTotals<br/>Sum All Extensions]
    end
    
    EXT_MANAGER --> ADD_BTN
    EXT_MANAGER --> COUNTER
    EXT_MANAGER --> E1
    EXT_MANAGER --> E2
    EXT_MANAGER --> E3
    EXT_MANAGER --> EN
    
    E1 -->|onUpdate| UPDATE
    E2 -->|onUpdate| UPDATE
    E3 -->|onUpdate| UPDATE
    EN -->|onUpdate| UPDATE
    
    E1 -->|onRemove| REMOVE
    E2 -->|onRemove| REMOVE
    E3 -->|onRemove| REMOVE
    EN -->|onRemove| REMOVE
    
    UPDATE --> CALC_TOTAL
    REMOVE --> CALC_TOTAL
    
    classDef manager fill:#d32f2f,color:#fff,stroke:#000,stroke-width:3px
    classDef control fill:#f44336,color:#fff,stroke:#000,stroke-width:2px
    classDef form fill:#ef5350,color:#fff,stroke:#000,stroke-width:2px
    classDef action fill:#e57373,color:#fff,stroke:#000,stroke-width:2px
    
    class EXT_MANAGER manager
    class ADD_BTN,COUNTER control
    class E1,E2,E3,EN form
    class UPDATE,REMOVE,CALC_TOTAL action
```

### 5. UI Component Library Structure
```mermaid
flowchart TD
    subgraph "UI Components Library"
        subgraph "Layout Components"
            CARD[Card<br/>CardHeader<br/>CardContent<br/>CardTitle]
        end
        
        subgraph "Form Components"
            INPUT[Input<br/>Text, Date, Number]
            LABEL[Label<br/>Form Labels]
            BUTTON[Button<br/>Primary, Secondary]
        end
        
        subgraph "Display Components"
            BADGE[Badge<br/>Status Indicators]
            ICON[Lucide Icons<br/>Visual Elements]
        end
    end
    
    subgraph "Form Sections Usage"
        BASIC_USE[BasicInformation<br/>Uses: Input, Label, Card]
        FUNDING_USE[InitialFunding<br/>Uses: Input, Label, Card, Button]
        STATUS_USE[StatusDisplay<br/>Uses: Badge, Card, Icon]
    end
    
    INPUT -.->|imported by| BASIC_USE
    LABEL -.->|imported by| BASIC_USE
    CARD -.->|imported by| BASIC_USE
    
    INPUT -.->|imported by| FUNDING_USE
    LABEL -.->|imported by| FUNDING_USE
    CARD -.->|imported by| FUNDING_USE
    BUTTON -.->|imported by| FUNDING_USE
    
    BADGE -.->|imported by| STATUS_USE
    CARD -.->|imported by| STATUS_USE
    ICON -.->|imported by| STATUS_USE
    
    classDef ui fill:#00796b,color:#fff,stroke:#000,stroke-width:2px
    classDef usage fill:#26a69a,color:#fff,stroke:#000,stroke-width:2px
    
    class CARD,INPUT,LABEL,BUTTON,BADGE,ICON ui
    class BASIC_USE,FUNDING_USE,STATUS_USE usage
```

## Component Responsibilities

### **EnhancedMEDEVACForm.js** - Master Controller
- **State Management**: Maintains complete formData state
- **Section Navigation**: Controls which section is displayed
- **Calculation Orchestration**: Triggers business logic calculations
- **Data Persistence**: Handles form submission to localStorage

### **Section Components** - Feature Modules
- **BasicInformation**: Patient info, agency type, post selection
- **InitialFunding**: Core funding data with per diem calculator
- **AmendmentSection**: Optional amendment (A1) with add/remove logic
- **ExtensionsSection**: Dynamic extension management (E1-E10)
- **CompletionSection**: Final accounting and comments

### **Specialized Components** - Focused Functionality
- **StatusDisplay**: Real-time status and financial summaries
- **LocationFields**: Post selection with automatic region lookup
- **CableTracking**: Cable in/out date management
- **PerDiemCalculator**: Multi-rate per diem calculations
- **FinancialSummary**: Comprehensive funding breakdowns

### **UI Components** - Reusable Elements
- **Card System**: Consistent layout containers
- **Form Controls**: Standardized inputs and labels
- **Status Indicators**: Badges and visual feedback
- **Icons**: Lucide icon system for visual enhancement

## Props Flow Pattern

### Standard Props Pattern
```javascript
// Parent to Child
<ChildComponent 
  formData={formData}
  setFormData={setFormData}
  // Additional specific props
/>

// Child Component
const ChildComponent = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
};
```

### Extension Props Pattern
```javascript
// Extensions Manager
<ExtensionForm 
  extension={extension}
  onUpdate={(updatedExtension) => updateExtension(index, updatedExtension)}
  onRemove={() => removeExtension(index)}
  extensionNumber={index + 1}
/>
```

This component relationship diagram shows the clean separation of concerns, unidirectional data flow, and modular architecture that makes the MEDEVAC form system maintainable and scalable.