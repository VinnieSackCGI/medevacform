# MEDEVAC Form - Attributes & Business Rules

## Overview
This document outlines the data attributes and business rules for a MEDEVAC (Medical Evacuation) tracking system to be implemented as a React application. The system tracks medical evacuation missions including initial funding, amendments, and extensions.

---

## Core Attributes

### 1. Basic Information

#### MEDEVAC Status
- **Type**: String (Calculated)
- **Options**:
  - "N/A"
  - "Initiated"
  - "Initial In Processing"
  - "Initial Funding Out"
  - "Amendment In Processing"
  - "Amendment Funding Out"
  - "1st Extension In Processing"
  - "1st Extension Funding Out"
  - "2nd Extension In Processing"
  - "2nd Extension Funding Out"
  - ... (up to 10th Extension)
- **Business Rule**: Auto-calculated based on the latest funding stage completed
- **Read-only**: Yes

#### Cable Status
- **Type**: String/Number (Calculated)
- **Values**:
  - "N/A"
  - "Sent"
  - Number of days in processing
- **Business Rule**: Calculates days between cable in and cable out dates, shows "Sent" if cable out date exists
- **Read-only**: Yes

#### Obligation Number
- **Type**: String (Calculated)
- **Format**: `YY[10|90]XXX`
  - YY = Last 2 digits of fiscal year
  - 10 = DOS/Seabee cases
  - 90 = MSG cases
  - XXX = Sequential number (001-999)
- **Business Rule**: Auto-generated based on fiscal year and agency type
- **Read-only**: Yes

#### MSG, DOS, or Seabee
- **Type**: Dropdown
- **Options**:
  - "MSG"
  - "DOS"
  - "Seabee"
  - "DOS/Seabee"
- **Required**: Yes

#### Patient Name
- **Type**: Text
- **Required**: Yes
- **Validation**: Should follow format "LAST NAME, FIRST NAME"

#### Total Obligation
- **Type**: Currency (Calculated)
- **Business Rule**: Sum of Initial Funding + all Amendment Funding + all Extension Funding
- **Read-only**: Yes
- **Format**: USD currency

---

### 2. Date Fields

#### Start Date
- **Type**: Date (Calculated)
- **Business Rule**: Takes Initial Start Date or most recent Amended Start Date if amendment exists
- **Read-only**: Yes

#### End Date
- **Type**: Date (Calculated)
- **Business Rule**: Latest date from all extensions, or Initial End Date if no extensions
- **Read-only**: Yes

#### Initial Start Date
- **Type**: Date
- **Required**: Yes

#### Initial End Date
- **Type**: Date
- **Required**: Yes
- **Validation**: Must be after Initial Start Date

#### Number of Days
- **Type**: Number (Calculated)
- **Business Rule**: Calculated from Start Date to End Date
- **Read-only**: Yes

---

### 3. Classification Fields

#### MEDEVAC Type
- **Type**: Dropdown
- **Options**:
  - "MED-MSG"
  - "DENTEVAC"
  - "MED In Conj"
  - "MHS-MSG"
  - "OB"
  - "MEDICAL"
  - "MHS"
  - "MED-AIR AMB"
  - "UHIEVAC"
- **Required**: Yes

#### Traveler Type
- **Type**: Dropdown
- **Options**:
  - "EMP" (Employee)
  - "EFM" (Eligible Family Member)
  - "DEP" (Dependent)
- **Required**: Yes

#### Employee Status or Name
- **Type**: Dropdown/Text
- **Options**:
  - "EMP"
  - "EFM"
  - "DEP"
  - Or specific name if additional traveler
- **Required**: Yes

---

### 4. Location Fields

#### Region
- **Type**: Dropdown
- **Options**:
  - "SCA"
  - "NEA"
  - "AF" (Africa)
  - "EUR" (Europe)
  - "EAP" (East Asia Pacific)
  - "WHA" (Western Hemisphere)
- **Required**: Yes

#### Home Post
- **Type**: Dropdown
- **Business Rule**: Populated from List of Posts/Cities
- **Dependent On**: Selected Region
- **Required**: Yes

#### MEDEVAC Location
- **Type**: Text/Dropdown
- **Business Rule**: Latest location (tracks changes through amendments)
- **Read-only**: Yes (calculated from most recent amendment or initial location)

#### Initial MEDEVAC Location
- **Type**: Text
- **Required**: Yes
- **Example**: "WARSAW", "LONDON", "TOKYO"

#### Route (CONUS/OCONUS)
- **Type**: Dropdown
- **Options**:
  - "CONUS" (Continental United States)
  - "OCONUS" (Outside Continental United States)
- **Required**: Yes

---

### 5. Amendment & Extension Tracking

#### Number of Amendments
- **Type**: Number (Calculated)
- **Business Rule**: Counts number of amendments (0-10)
- **Read-only**: Yes

#### Duration of Extensions
- **Type**: Number (Calculated)
- **Business Rule**: Total days added through all extensions
- **Read-only**: Yes

---

### 6. Funding & Cable Processing

#### Funding Cable In Date
- **Type**: Date
- **Required**: Yes
- **Description**: Date cable requesting funding was received

#### Funding Cable Sent Date
- **Type**: Date
- **Required**: No
- **Description**: Date funding cable was sent out

#### BD Employee
- **Type**: Dropdown
- **Options**: FS (Foreign Service), LS (Local Staff)
- **Required**: Yes

#### Employee Response Time
- **Type**: Number (Calculated)
- **Business Rule**: Days between cable in and cable sent
- **Read-only**: Yes

---

### 7. Financial Details

#### 1st Per Diem Rate
- **Type**: Currency
- **Description**: Lodging + M&IE (Meals & Incidental Expenses)
- **Required**: Yes

#### # of Days at (1st Rate)
- **Type**: Number
- **Required**: Yes
- **Validation**: Must be >= 0

#### 2nd Per Diem Rate
- **Type**: Currency
- **Required**: No (if location changes)

#### # of Days at2 (2nd Rate)
- **Type**: Number
- **Required**: No

#### 3rd Per Diem Rate
- **Type**: Currency
- **Required**: No

#### # of Days at3 (3rd Rate)
- **Type**: Number
- **Required**: No

#### 4th Per Diem Rate
- **Type**: Currency
- **Required**: No

#### # of Days at4 (4th Rate)
- **Type**: Number
- **Required**: No

#### Airfare
- **Type**: Currency
- **Required**: Yes

#### Total Per Diem - Patient
- **Type**: Currency (Calculated)
- **Business Rule**: Sum of (Per Diem Rate × Days) for all rates
- **Read-only**: Yes

#### Total Per Diem - Additional Travelers
- **Type**: Currency
- **Required**: No (if additional travelers exist)

#### Misc. Expenses
- **Type**: Currency
- **Required**: No

#### Total Per Diem
- **Type**: Currency (Calculated)
- **Business Rule**: Patient Per Diem + Additional Travelers Per Diem + Misc Expenses
- **Read-only**: Yes

#### Initial Funding Total
- **Type**: Currency (Calculated)
- **Business Rule**: Airfare + Total Per Diem
- **Read-only**: Yes

---

## Amendment Section (A1)

### Amendment Fields (Repeatable up to 1 amendment)

#### A1 - Amended Start Date
- **Type**: Date
- **Required**: If amendment exists

#### A1 - Amended End Date
- **Type**: Date
- **Required**: If amendment exists

#### A1 - Amendment Funding Cable In Date
- **Type**: Date

#### A1 - Amendment Funding Cable Out Date
- **Type**: Date

#### A1 - BD Employee
- **Type**: Dropdown
- **Options**: FS, LS

#### A1 - Employee Response Time
- **Type**: Number (Calculated)

#### A1 - Amended MEDEVAC Location
- **Type**: Text
- **Description**: New location if patient moved

#### A1 - Per Diem Rates (1st through 4th)
- **Type**: Currency
- **Description**: Same structure as initial per diem rates

#### A1 - # of Days At Each Rate
- **Type**: Number
- **Validation**: Must be >= 0

#### A1 - Airfare
- **Type**: Currency

#### A1 - Total Per Diem Additional Travelers
- **Type**: Currency

#### A1 - Misc. Expenses
- **Type**: Currency

#### A1 - Airfare Amount for Obligation
- **Type**: Currency (Calculated)

#### A1 - Per Diem Amount for Obligation
- **Type**: Currency (Calculated)

#### A1 - New Obligation Total
- **Type**: Currency (Calculated)
- **Business Rule**: Sum of airfare + per diem amounts

---

## Extension Sections (E1 - E10)

### Extension Fields (Repeatable up to 10 times)

Each extension (E1 through E10) has the following fields:

#### E[n] - Extension End Date
- **Type**: Date
- **Required**: If extension exists
- **Validation**: Must be after previous end date

#### E[n] - Extension Funding Cable In Date
- **Type**: Date

#### E[n] - Extension Funding Cable Out Date
- **Type**: Date

#### E[n] - BD Employee
- **Type**: Dropdown
- **Options**: FS, LS

#### E[n] - Employee Response Time
- **Type**: Number (Calculated)
- **Business Rule**: Days between cable in and out

#### E[n] - MEDEVAC Location
- **Type**: Text
- **Description**: Location during this extension

#### E[n] - 1st Per Diem Rate (Lodging + M&IE)
- **Type**: Currency

#### E[n] - # of Days At 1st Per Diem Rate
- **Type**: Number

#### E[n] - 2nd Per Diem Rate (Lodging + M&IE)
- **Type**: Currency

#### E[n] - # of Days At 2nd Per Diem Rate
- **Type**: Number

#### E[n] - 3rd Per Diem Rate (Lodging + M&IE)
- **Type**: Currency

#### E[n] - # of Days At 3rd Per Diem Rate
- **Type**: Number

#### E[n] - 4th Per Diem Rate (Lodging + M&IE)
- **Type**: Currency

#### E[n] - # of Days At 4th Per Diem Rate
- **Type**: Number

#### E[n] - Airfare
- **Type**: Currency

#### E[n] - Total Per Diem Additional Travelers
- **Type**: Currency

#### E[n] - Additional Per Diem Amount
- **Type**: Currency (Calculated)
- **Business Rule**: Sum of (Per Diem Rate × Days) for all rates

#### E[n] - Extension Funding Total
- **Type**: Currency (Calculated)
- **Business Rule**: Airfare + Additional Per Diem + Additional Travelers

---

## Completion & Accounting Fields

#### Completion Status
- **Type**: Dropdown
- **Options**:
  - "Closed"
  - "Recalled"
  - "Final Acct"
  - "RTP" (Return to Post)
  - "Terminated"
  - "Other"
- **Required**: Yes (at case completion)

#### Date of Final Accounting
- **Type**: Date
- **Required**: If completion status is "Final Acct"

#### Actual Start Date
- **Type**: Date
- **Description**: Actual date patient travel began

#### Actual End Date
- **Type**: Date
- **Description**: Actual date patient travel ended

#### Airfare Approved
- **Type**: Currency
- **Description**: Final approved airfare amount

#### Per Diem Approved
- **Type**: Currency
- **Description**: Final approved per diem amount

#### Closed Amount
- **Type**: Currency (Calculated)
- **Business Rule**: Airfare Approved + Per Diem Approved

#### Amount for Deobligation
- **Type**: Currency (Calculated)
- **Business Rule**: Total Obligation - Closed Amount
- **Description**: Unused funds to be returned

#### Comments
- **Type**: Text Area
- **Required**: No
- **Max Length**: 1000 characters

#### Date to send Request for Final Accounting (FA)
- **Type**: Date (Calculated)
- **Business Rule**: Actual End Date + 30 days
- **Read-only**: Yes

---

## Business Rules Summary

### Validation Rules

1. **Date Validation**
   - End dates must be after start dates
   - Extension dates must be sequential
   - Cable out date must be after cable in date

2. **Financial Validation**
   - All currency fields must be >= 0
   - Number of days must be > 0 if per diem rate is entered
   - Total obligation cannot exceed a configurable maximum

3. **Required Field Logic**
   - If amendment exists, amendment dates and location are required
   - If extension exists, extension end date is required
   - Additional traveler fields required if traveler type is not "EMP"

4. **Status Progression**
   - MEDEVAC Status automatically updates based on latest cable sent date
   - Cannot skip funding stages
   - Must complete initial funding before amendments/extensions

### Calculation Rules

1. **Obligation Number Generation**
   ```
   Format: [FY Last 2 digits][Agency Code][Sequential Number]
   Agency Code: 10 for DOS/Seabee, 90 for MSG
   Example: 23010001 (FY2023, DOS, case #1)
   ```

2. **Total Obligation Calculation**
   ```
   Total Obligation = Initial Funding Total
                    + A1 New Obligation Total
                    + E1 Extension Funding Total
                    + E2 Extension Funding Total
                    + ... (up to E10)
   ```

3. **Per Diem Calculation**
   ```
   Total Per Diem = (Rate1 × Days1) + (Rate2 × Days2)
                  + (Rate3 × Days3) + (Rate4 × Days4)
                  + Additional Travelers Per Diem
                  + Misc Expenses
   ```

4. **Response Time Calculation**
   ```
   Employee Response Time = Cable Sent Date - Cable In Date
   ```

5. **Days Calculation**
   ```
   Number of Days = End Date - Start Date + 1
   ```

### Conditional Display Rules

1. **Amendment Section**
   - Only display if amendment is initiated
   - Hide fields until "Add Amendment" action

2. **Extension Sections**
   - Display E1 only after initial funding complete
   - Display E[n+1] only after E[n] is complete
   - Maximum 10 extensions allowed

3. **Additional Traveler Fields**
   - Show only if "Total Per Diem - Additional Travelers" > 0
   - Allow multiple additional travelers to be tracked

4. **Final Accounting Section**
   - Only display when Completion Status is selected
   - Make read-only after final accounting date is set

### Lookup Data Sources

1. **Posts/Cities List**: City, Country, Bureau mapping
2. **Regional Bureaus**: SCA, NEA, AF, EUR, EAP, WHA
3. **MEDEVAC Types**: Predefined list of medical evacuation categories
4. **Agencies**: MSG, Peace Corps, State, CDC, DEA, etc.
5. **Vendors**: PAG, REVA, Netcare 911, ISOS, Parkway, SOS, Local

---

## React Form Structure Recommendations

### Component Hierarchy

```
MEDEVACForm
├── BasicInformation
│   ├── PatientDetails
│   ├── ClassificationFields
│   └── LocationFields
├── InitialFunding
│   ├── FundingDates
│   ├── PerDiemCalculator
│   └── FinancialSummary
├── AmendmentSection (conditional)
│   ├── AmendmentDetails
│   └── AmendmentFunding
├── ExtensionsSection (dynamic array)
│   └── Extension (E1-E10)
│       ├── ExtensionDetails
│       └── ExtensionFunding
└── CompletionSection (conditional)
    ├── ActualDates
    ├── FinalAccounting
    └── Comments
```

### State Management Recommendations

1. **Form State**: Use React Hook Form or Formik for complex validations
2. **Calculated Fields**: Use useMemo hooks to auto-calculate derived values
3. **Dynamic Sections**: Use field arrays for extensions
4. **Lookup Data**: Store in context or Redux for global access

### Field Types Mapping

- **Dropdowns**: Select/Autocomplete components
- **Dates**: DatePicker components
- **Currency**: Number input with currency formatting
- **Calculated Fields**: Read-only inputs with calculated display
- **Text Areas**: Multi-line text input
- **Dynamic Arrays**: FieldArray components

### Validation Schema (Yup/Zod)

Implement validation for:
- Required fields
- Date ranges
- Numeric ranges (>= 0)
- Conditional requirements
- Format validations (obligation number, patient name)

---

## Additional Considerations

### Accessibility
- Proper ARIA labels for all form fields
- Keyboard navigation support
- Screen reader compatibility
- Error message announcements

### Performance
- Lazy load extension sections
- Debounce calculation updates
- Optimize re-renders with React.memo

### Data Persistence
- Auto-save drafts
- Version history tracking
- Audit trail for changes

### Export/Integration
- PDF generation for completed forms
- Excel export functionality
- API integration endpoints for cable systems
