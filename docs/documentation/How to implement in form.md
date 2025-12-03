# MEDEVAC Excel to React Web Form - Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Excel Structure Analysis](#excel-structure-analysis)
3. [Technology Stack](#technology-stack)
4. [Form Structure & Components](#form-structure--components)
5. [Field Types & Mapping](#field-types--mapping)
6. [Calculated Fields Implementation](#calculated-fields-implementation)
7. [Validation Rules](#validation-rules)
8. [State Management](#state-management)
9. [Reference Data](#reference-data)
10. [Step-by-Step Implementation](#step-by-step-implementation)

---

## Overview

This guide provides detailed instructions for converting the MEDEVAC Excel tracker (`Updated MEDEVAC Example List.xlsx`) into a React web application. The Excel workbook contains complex calculations, repeating sections (extensions), and reference data that must be accurately replicated in the web form.

### Key Excel Characteristics:
- **Main Worksheet**: `FY2023 MEDEVAC Tracker` (301 columns)
- **Reference Data**: `List` worksheet (City/Post, Country, Bureau mappings)
- **Calculated Fields**: 15 fields with grey backgrounds containing formulas
- **Input Fields**: 2 primary input fields, plus many fields in the detailed sections
- **Repeating Sections**: Up to 10 extensions + 1 amendment

---

## Excel Structure Analysis

### Column Organization

The Excel tracker has the following structure:

#### Summary Section (Columns B-R)
These are displayed at the beginning and provide a high-level overview:

| Column | Field Name | Type | Description |
|--------|-----------|------|-------------|
| B | MEDEVAC Status | Calculated | Current status (e.g., "Initial Funding Out", "1st Extension In Processing") |
| C | Cable Status | Calculated | Days in processing or "Sent" |
| D | Obligation Number | Calculated | Auto-generated (Format: YY[10\|90]XXX) |
| E | MSG, DOS, or Seabee | Input | Dropdown selection |
| F | Patient Name | Input | Text field |
| G | Total Obligation | Calculated | Sum of all funding |
| H | Start Date | Calculated | Initial or amended start date |
| I | End Date | Calculated | Latest end date across all extensions |
| J | MEDEVAC Type | Input | Dropdown (MEDICAL, DENTEVAC, etc.) |
| K | Traveler Type | Input | Dropdown (EMP, EFM, DEP) |
| L | Employee Status or Name | Input | Dropdown/Text |
| M | Region | Calculated | VLOOKUP from Home Post |
| N | Home Post | Input | Dropdown |
| O | MEDEVAC Location | Calculated | Latest location |
| P | Route (CONUS/OCONUS) | Input | Dropdown |
| Q | Number of Amendments | Calculated | Count of amendments |
| R | Duration of Extensions | Calculated | Total extension days |

#### Detailed Sections (Beyond Column R)
- **Initial Funding Section**: Dates, per diem rates, airfare, cable tracking
- **Amendment Section**: Similar structure to initial funding (optional)
- **Extension Sections (E1-E10)**: Repeating sections for up to 10 extensions
- **Completion Section**: Final accounting, actual dates, deobligation

### Calculated vs Input Fields

**Calculated Fields (Grey Background in Excel)**:
- MEDEVAC Status
- Cable Status
- Obligation Number
- Total Obligation
- Start Date
- End Date
- Region (VLOOKUP)
- MEDEVAC Location
- Number of Amendments
- All per diem totals
- All funding totals
- Employee Response Times

**Input Fields (White Background)**:
- Patient Name
- MSG, DOS, or Seabee
- MEDEVAC Type
- Traveler Type
- Home Post
- Route
- All date fields (cable in/out dates, initial dates, extension dates)
- All per diem rates and day counts
- Airfare amounts
- Additional traveler per diem
- Miscellaneous expenses

---

## Technology Stack

### Recommended Technologies

```json
{
  "framework": "React 18+",
  "formManagement": "React Hook Form",
  "validation": "Zod or Yup",
  "uiLibrary": "shadcn/ui or Material-UI",
  "dateHandling": "date-fns or Day.js",
  "stateManagement": "React Context API or Zustand",
  "styling": "Tailwind CSS"
}
```

### Installation Commands

```bash
# Create React app (if starting fresh)
npx create-react-app medevac-form
cd medevac-form

# Install dependencies
npm install react-hook-form zod @hookform/resolvers
npm install date-fns
npm install zustand
npm install tailwindcss

# Install UI library (choose one)
npm install @mui/material @emotion/react @emotion/styled
# OR
npx shadcn-ui@latest init
```

---

## Form Structure & Components

### Component Hierarchy

```
src/
├── components/
│   ├── MEDEVACForm/
│   │   ├── index.jsx                    # Main form container
│   │   ├── SummarySection.jsx           # Columns B-R (read-only display)
│   │   ├── BasicInfoSection.jsx         # Core input fields
│   │   ├── InitialFundingSection.jsx    # Initial funding inputs
│   │   ├── AmendmentSection.jsx         # Amendment (conditional)
│   │   ├── ExtensionSection.jsx         # Single extension component
│   │   ├── ExtensionsManager.jsx        # Manages E1-E10
│   │   ├── CompletionSection.jsx        # Final accounting
│   │   └── CalculatedField.jsx          # Reusable calculated field
│   ├── FormFields/
│   │   ├── DatePicker.jsx
│   │   ├── CurrencyInput.jsx
│   │   ├── Dropdown.jsx
│   │   └── NumberInput.jsx
│   └── shared/
│       ├── PerDiemCalculator.jsx        # Reusable per diem logic
│       └── CableTracker.jsx             # Cable in/out tracking
├── hooks/
│   ├── useCalculations.js               # All calculation logic
│   ├── useFormValidation.js             # Validation schemas
│   └── useReferenceData.js              # Fetch/manage lookup data
├── utils/
│   ├── calculations.js                  # Pure calculation functions
│   ├── dateHelpers.js                   # Date utilities
│   └── formatters.js                    # Currency, number formatting
├── data/
│   ├── referenceData.json               # City/Country/Bureau data
│   └── dropdownOptions.js               # All dropdown options
└── store/
    └── formStore.js                     # Zustand store (optional)
```

### Main Form Component Structure

```jsx
// src/components/MEDEVACForm/index.jsx
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from './validation';
import { useCalculations } from '../../hooks/useCalculations';

export default function MEDEVACForm() {
  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Basic Info
      agencyType: 'MSG',
      patientName: '',
      medevacType: '',
      travelerType: 'EMP',
      homePost: '',
      route: 'OCONUS',

      // Initial Funding
      initialStartDate: null,
      initialEndDate: null,
      initialLocation: '',
      initialCableInDate: null,
      initialCableSentDate: null,
      bdEmployee: 'FS',

      // Per Diem (up to 4 rates)
      perDiem1Rate: 0,
      perDiem1Days: 0,
      perDiem2Rate: 0,
      perDiem2Days: 0,
      perDiem3Rate: 0,
      perDiem3Days: 0,
      perDiem4Rate: 0,
      perDiem4Days: 0,

      airfare: 0,
      additionalTravelersPerDiem: 0,
      miscExpenses: 0,

      // Amendment (optional)
      amendment: null,

      // Extensions (array)
      extensions: []
    }
  });

  const formData = methods.watch();
  const calculated = useCalculations(formData);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SummarySection calculated={calculated} />
        <BasicInfoSection />
        <InitialFundingSection />
        {formData.amendment && <AmendmentSection />}
        <ExtensionsManager />
        <CompletionSection />
      </form>
    </FormProvider>
  );
}
```

---

## Field Types & Mapping

### Input Field Components

#### 1. Dropdown Fields

```jsx
// src/components/FormFields/Dropdown.jsx
import { useFormContext } from 'react-hook-form';

export default function Dropdown({ name, label, options, required }) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <select
        id={name}
        {...register(name)}
        className={errors[name] ? 'error' : ''}
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {errors[name] && <span className="error-msg">{errors[name].message}</span>}
    </div>
  );
}
```

**Dropdown Options**:

```javascript
// src/data/dropdownOptions.js
export const AGENCY_TYPES = [
  { value: 'MSG', label: 'MSG' },
  { value: 'DOS', label: 'DOS' },
  { value: 'Seabee', label: 'Seabee' },
  { value: 'DOS/Seabee', label: 'DOS/Seabee' }
];

export const MEDEVAC_TYPES = [
  { value: 'MED-MSG', label: 'MED-MSG' },
  { value: 'DENTEVAC', label: 'DENTEVAC' },
  { value: 'MED In Conj', label: 'MED In Conj' },
  { value: 'MHS-MSG', label: 'MHS-MSG' },
  { value: 'OB', label: 'OB' },
  { value: 'MEDICAL', label: 'MEDICAL' },
  { value: 'MHS', label: 'MHS' },
  { value: 'MED-AIR AMB', label: 'MED-AIR AMB' },
  { value: 'UHIEVAC', label: 'UHIEVAC' }
];

export const TRAVELER_TYPES = [
  { value: 'EMP', label: 'Employee (EMP)' },
  { value: 'EFM', label: 'Eligible Family Member (EFM)' },
  { value: 'DEP', label: 'Dependent (DEP)' }
];

export const ROUTE_TYPES = [
  { value: 'CONUS', label: 'CONUS (Continental US)' },
  { value: 'OCONUS', label: 'OCONUS (Outside Continental US)' }
];

export const BD_EMPLOYEE_TYPES = [
  { value: 'FS', label: 'FS (Foreign Service)' },
  { value: 'LS', label: 'LS (Local Staff)' }
];
```

#### 2. Currency Input

```jsx
// src/components/FormFields/CurrencyInput.jsx
import { useFormContext, Controller } from 'react-hook-form';

export default function CurrencyInput({ name, label, required }) {
  const { control, formState: { errors } } = useFormContext();

  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="$0.00"
            {...field}
            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
          />
        )}
      />
      {errors[name] && <span className="error-msg">{errors[name].message}</span>}
    </div>
  );
}
```

#### 3. Date Picker

```jsx
// src/components/FormFields/DatePicker.jsx
import { useFormContext, Controller } from 'react-hook-form';
import { format } from 'date-fns';

export default function DatePicker({ name, label, required, minDate, maxDate }) {
  const { control, formState: { errors } } = useFormContext();

  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            type="date"
            {...field}
            value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
            min={minDate ? format(new Date(minDate), 'yyyy-MM-dd') : undefined}
            max={maxDate ? format(new Date(maxDate), 'yyyy-MM-dd') : undefined}
          />
        )}
      />
      {errors[name] && <span className="error-msg">{errors[name].message}</span>}
    </div>
  );
}
```

#### 4. Calculated Field (Read-Only Display)

```jsx
// src/components/MEDEVACForm/CalculatedField.jsx
export default function CalculatedField({ label, value, format = 'text' }) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value || 0);
      case 'date':
        return value ? format(new Date(value), 'MM/dd/yyyy') : 'N/A';
      case 'number':
        return (value || 0).toString();
      default:
        return value || 'N/A';
    }
  };

  return (
    <div className="calculated-field">
      <label>{label}</label>
      <div className="calculated-value">{formatValue()}</div>
    </div>
  );
}
```

---

## Calculated Fields Implementation

### Key Calculations Hook

```javascript
// src/hooks/useCalculations.js
import { useMemo } from 'react';
import {
  calculateObligationNumber,
  calculateTotalObligation,
  calculateStartDate,
  calculateEndDate,
  calculateMEDEVACStatus,
  calculateCableStatus,
  calculatePerDiemTotal,
  calculateRegion,
  calculateLatestLocation,
  calculateNumberOfAmendments,
  calculateEmployeeResponseTime
} from '../utils/calculations';

export function useCalculations(formData) {
  return useMemo(() => {
    // Basic Calculations
    const obligationNumber = calculateObligationNumber(formData);
    const region = calculateRegion(formData.homePost);

    // Date Calculations
    const startDate = calculateStartDate(formData);
    const endDate = calculateEndDate(formData);

    // Financial Calculations
    const initialPerDiem = calculatePerDiemTotal({
      perDiem1: { rate: formData.perDiem1Rate, days: formData.perDiem1Days },
      perDiem2: { rate: formData.perDiem2Rate, days: formData.perDiem2Days },
      perDiem3: { rate: formData.perDiem3Rate, days: formData.perDiem3Days },
      perDiem4: { rate: formData.perDiem4Rate, days: formData.perDiem4Days },
      additionalTravelers: formData.additionalTravelersPerDiem,
      misc: formData.miscExpenses
    });

    const initialFundingTotal = formData.airfare + initialPerDiem;

    // Amendment calculations
    const amendmentTotal = formData.amendment
      ? calculateAmendmentTotal(formData.amendment)
      : 0;

    // Extensions calculations
    const extensionTotals = formData.extensions.map(ext =>
      calculateExtensionTotal(ext)
    );
    const totalExtensionFunding = extensionTotals.reduce((sum, val) => sum + val, 0);

    // Total Obligation
    const totalObligation = initialFundingTotal + amendmentTotal + totalExtensionFunding;

    // Status Calculations
    const medevacStatus = calculateMEDEVACStatus(formData);
    const cableStatus = calculateCableStatus(formData);

    // Location & Amendments
    const latestLocation = calculateLatestLocation(formData);
    const numberOfAmendments = calculateNumberOfAmendments(formData);

    return {
      obligationNumber,
      region,
      startDate,
      endDate,
      initialPerDiem,
      initialFundingTotal,
      amendmentTotal,
      extensionTotals,
      totalExtensionFunding,
      totalObligation,
      medevacStatus,
      cableStatus,
      latestLocation,
      numberOfAmendments
    };
  }, [formData]);
}
```

### Calculation Functions

```javascript
// src/utils/calculations.js
import { differenceInDays, max, isAfter, isBefore } from 'date-fns';
import referenceData from '../data/referenceData.json';

/**
 * Calculate Obligation Number
 * Format: YY[10|90]XXX
 * Example: 23010001 (FY2023, DOS, case #1)
 */
export function calculateObligationNumber(formData) {
  // Get fiscal year (October 1 - September 30)
  const today = new Date();
  const fiscalYearStart = new Date(today.getFullYear(), 9, 1); // Oct 1
  const fiscalYearStart860DaysAgo = new Date(today.getTime() - (860 * 24 * 60 * 60 * 1000));

  const fiscalYear = fiscalYearStart860DaysAgo.getFullYear();
  const fy = fiscalYear.toString().slice(-2); // Last 2 digits

  // Agency code
  const isDOSorSeabee = ['DOS', 'Seabee', 'DOS/Seabee'].includes(formData.agencyType);
  const agencyCode = isDOSorSeabee ? '10' : '90';

  // Sequential number (would need to be fetched from database in real app)
  const sequentialNumber = '001'; // Placeholder

  return `${fy}${agencyCode}${sequentialNumber}`;
}

/**
 * Calculate Per Diem Total
 * Sum of (rate × days) for all per diem rates + additional travelers + misc
 */
export function calculatePerDiemTotal({
  perDiem1 = { rate: 0, days: 0 },
  perDiem2 = { rate: 0, days: 0 },
  perDiem3 = { rate: 0, days: 0 },
  perDiem4 = { rate: 0, days: 0 },
  additionalTravelers = 0,
  misc = 0
}) {
  const rate1Total = (perDiem1.rate || 0) * (perDiem1.days || 0);
  const rate2Total = (perDiem2.rate || 0) * (perDiem2.days || 0);
  const rate3Total = (perDiem3.rate || 0) * (perDiem3.days || 0);
  const rate4Total = (perDiem4.rate || 0) * (perDiem4.days || 0);

  return rate1Total + rate2Total + rate3Total + rate4Total +
         (additionalTravelers || 0) + (misc || 0);
}

/**
 * Calculate Start Date
 * Returns amended start date if amendment exists, otherwise initial start date
 */
export function calculateStartDate(formData) {
  if (formData.amendment?.amendedStartDate) {
    return formData.amendment.amendedStartDate;
  }
  return formData.initialStartDate;
}

/**
 * Calculate End Date
 * Returns the latest date from all extensions, or initial/amended end date if no extensions
 */
export function calculateEndDate(formData) {
  const dates = [formData.initialEndDate];

  if (formData.amendment?.amendedEndDate) {
    dates.push(formData.amendment.amendedEndDate);
  }

  formData.extensions?.forEach(ext => {
    if (ext.endDate) {
      dates.push(ext.endDate);
    }
  });

  const validDates = dates.filter(d => d != null).map(d => new Date(d));
  return validDates.length > 0 ? max(validDates) : null;
}

/**
 * Calculate Total Obligation
 * Sum of initial + amendment + all extensions
 */
export function calculateTotalObligation(formData, calculated) {
  return (
    calculated.initialFundingTotal +
    calculated.amendmentTotal +
    calculated.totalExtensionFunding
  );
}

/**
 * Calculate MEDEVAC Status
 * Determines current status based on latest funding stage
 */
export function calculateMEDEVACStatus(formData) {
  // Check extensions (in reverse order - latest first)
  const extensions = formData.extensions || [];
  for (let i = extensions.length - 1; i >= 0; i--) {
    const ext = extensions[i];
    if (ext.cableSentDate) {
      return `${getOrdinal(i + 1)} Extension Funding Out`;
    }
    if (ext.cableInDate) {
      return `${getOrdinal(i + 1)} Extension In Processing`;
    }
  }

  // Check amendment
  if (formData.amendment) {
    if (formData.amendment.cableSentDate) {
      return 'Amendment Funding Out';
    }
    if (formData.amendment.cableInDate) {
      return 'Amendment In Processing';
    }
  }

  // Check initial
  if (formData.initialCableSentDate) {
    return 'Initial Funding Out';
  }
  if (formData.initialCableInDate) {
    return 'Initial In Processing';
  }

  return 'Initiated';
}

/**
 * Calculate Cable Status
 * Shows days in processing or "Sent"
 */
export function calculateCableStatus(formData) {
  // Find the most recent cable in progress
  const latestCable = findLatestCable(formData);

  if (!latestCable) return 'N/A';

  if (latestCable.sentDate) {
    return 'Sent';
  }

  if (latestCable.inDate) {
    const today = new Date();
    const daysInProcessing = differenceInDays(today, new Date(latestCable.inDate));
    return daysInProcessing;
  }

  return 'N/A';
}

/**
 * Find the latest cable in/out dates
 */
function findLatestCable(formData) {
  const extensions = formData.extensions || [];

  // Check latest extension first
  for (let i = extensions.length - 1; i >= 0; i--) {
    const ext = extensions[i];
    if (ext.cableInDate) {
      return {
        inDate: ext.cableInDate,
        sentDate: ext.cableSentDate
      };
    }
  }

  // Check amendment
  if (formData.amendment?.cableInDate) {
    return {
      inDate: formData.amendment.cableInDate,
      sentDate: formData.amendment.cableSentDate
    };
  }

  // Check initial
  if (formData.initialCableInDate) {
    return {
      inDate: formData.initialCableInDate,
      sentDate: formData.initialCableSentDate
    };
  }

  return null;
}

/**
 * Calculate Region from Home Post
 * Uses VLOOKUP equivalent from reference data
 */
export function calculateRegion(homePost) {
  if (!homePost) return null;

  const post = referenceData.find(item =>
    item['CITY/POST'] === homePost
  );

  return post ? post['BUREAU'] : null;
}

/**
 * Calculate Latest MEDEVAC Location
 * Returns most recent location from extensions, amendment, or initial
 */
export function calculateLatestLocation(formData) {
  const extensions = formData.extensions || [];

  // Check latest extension first
  for (let i = extensions.length - 1; i >= 0; i--) {
    if (extensions[i].location) {
      return extensions[i].location;
    }
  }

  // Check amendment
  if (formData.amendment?.location) {
    return formData.amendment.location;
  }

  // Return initial location
  return formData.initialLocation;
}

/**
 * Calculate Number of Amendments
 */
export function calculateNumberOfAmendments(formData) {
  return formData.amendment ? 1 : 0;
}

/**
 * Calculate Employee Response Time
 * Business days between cable in and cable sent (excluding weekends)
 */
export function calculateEmployeeResponseTime(cableInDate, cableSentDate) {
  if (!cableInDate || !cableSentDate) return 'N/A';

  return differenceInDays(
    new Date(cableSentDate),
    new Date(cableInDate)
  );
}

/**
 * Helper: Get ordinal string (1st, 2nd, 3rd, etc.)
 */
function getOrdinal(n) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Calculate Amendment Total
 */
export function calculateAmendmentTotal(amendment) {
  if (!amendment) return 0;

  const perDiemTotal = calculatePerDiemTotal({
    perDiem1: { rate: amendment.perDiem1Rate, days: amendment.perDiem1Days },
    perDiem2: { rate: amendment.perDiem2Rate, days: amendment.perDiem2Days },
    perDiem3: { rate: amendment.perDiem3Rate, days: amendment.perDiem3Days },
    perDiem4: { rate: amendment.perDiem4Rate, days: amendment.perDiem4Days },
    additionalTravelers: amendment.additionalTravelersPerDiem,
    misc: amendment.miscExpenses
  });

  return (amendment.airfare || 0) + perDiemTotal;
}

/**
 * Calculate Extension Total
 */
export function calculateExtensionTotal(extension) {
  if (!extension) return 0;

  const perDiemTotal = calculatePerDiemTotal({
    perDiem1: { rate: extension.perDiem1Rate, days: extension.perDiem1Days },
    perDiem2: { rate: extension.perDiem2Rate, days: extension.perDiem2Days },
    perDiem3: { rate: extension.perDiem3Rate, days: extension.perDiem3Days },
    perDiem4: { rate: extension.perDiem4Rate, days: extension.perDiem4Days },
    additionalTravelers: extension.additionalTravelersPerDiem,
    misc: extension.miscExpenses
  });

  return (extension.airfare || 0) + perDiemTotal;
}
```

---

## Validation Rules

### Validation Schema with Zod

```javascript
// src/hooks/useFormValidation.js
import { z } from 'zod';

export const formSchema = z.object({
  // Basic Information
  agencyType: z.enum(['MSG', 'DOS', 'Seabee', 'DOS/Seabee'], {
    required_error: 'Agency type is required'
  }),

  patientName: z.string()
    .min(1, 'Patient name is required')
    .regex(/^[A-Z]+,\s[A-Z]+/, 'Format: LAST NAME, FIRST NAME'),

  medevacType: z.string().min(1, 'MEDEVAC type is required'),

  travelerType: z.enum(['EMP', 'EFM', 'DEP'], {
    required_error: 'Traveler type is required'
  }),

  homePost: z.string().min(1, 'Home post is required'),

  route: z.enum(['CONUS', 'OCONUS'], {
    required_error: 'Route is required'
  }),

  // Initial Funding
  initialStartDate: z.date({
    required_error: 'Initial start date is required'
  }),

  initialEndDate: z.date({
    required_error: 'Initial end date is required'
  }),

  initialLocation: z.string().min(1, 'Initial location is required'),

  initialCableInDate: z.date().optional(),
  initialCableSentDate: z.date().optional(),

  bdEmployee: z.enum(['FS', 'LS']),

  // Per Diem
  perDiem1Rate: z.number().min(0, 'Must be >= 0'),
  perDiem1Days: z.number().min(0, 'Must be >= 0'),
  perDiem2Rate: z.number().min(0, 'Must be >= 0').optional(),
  perDiem2Days: z.number().min(0, 'Must be >= 0').optional(),
  perDiem3Rate: z.number().min(0, 'Must be >= 0').optional(),
  perDiem3Days: z.number().min(0, 'Must be >= 0').optional(),
  perDiem4Rate: z.number().min(0, 'Must be >= 0').optional(),
  perDiem4Days: z.number().min(0, 'Must be >= 0').optional(),

  airfare: z.number().min(0, 'Airfare must be >= 0'),
  additionalTravelersPerDiem: z.number().min(0).optional(),
  miscExpenses: z.number().min(0).optional(),

  // Amendment (optional object)
  amendment: z.object({
    amendedStartDate: z.date(),
    amendedEndDate: z.date(),
    location: z.string().optional(),
    cableInDate: z.date().optional(),
    cableSentDate: z.date().optional(),
    bdEmployee: z.enum(['FS', 'LS']),
    perDiem1Rate: z.number().min(0),
    perDiem1Days: z.number().min(0),
    perDiem2Rate: z.number().min(0).optional(),
    perDiem2Days: z.number().min(0).optional(),
    perDiem3Rate: z.number().min(0).optional(),
    perDiem3Days: z.number().min(0).optional(),
    perDiem4Rate: z.number().min(0).optional(),
    perDiem4Days: z.number().min(0).optional(),
    airfare: z.number().min(0),
    additionalTravelersPerDiem: z.number().min(0).optional(),
    miscExpenses: z.number().min(0).optional(),
  }).optional().nullable(),

  // Extensions (array)
  extensions: z.array(z.object({
    endDate: z.date({
      required_error: 'Extension end date is required'
    }),
    location: z.string().optional(),
    cableInDate: z.date().optional(),
    cableSentDate: z.date().optional(),
    bdEmployee: z.enum(['FS', 'LS']),
    perDiem1Rate: z.number().min(0),
    perDiem1Days: z.number().min(0),
    perDiem2Rate: z.number().min(0).optional(),
    perDiem2Days: z.number().min(0).optional(),
    perDiem3Rate: z.number().min(0).optional(),
    perDiem3Days: z.number().min(0).optional(),
    perDiem4Rate: z.number().min(0).optional(),
    perDiem4Days: z.number().min(0).optional(),
    airfare: z.number().min(0),
    additionalTravelersPerDiem: z.number().min(0).optional(),
    miscExpenses: z.number().min(0).optional(),
  })).max(10, 'Maximum 10 extensions allowed')

}).refine(
  // Date validation: End date must be after start date
  (data) => {
    if (data.initialEndDate && data.initialStartDate) {
      return data.initialEndDate > data.initialStartDate;
    }
    return true;
  },
  {
    message: 'Initial end date must be after start date',
    path: ['initialEndDate']
  }
).refine(
  // Cable validation: Cable sent must be after cable in
  (data) => {
    if (data.initialCableSentDate && data.initialCableInDate) {
      return data.initialCableSentDate >= data.initialCableInDate;
    }
    return true;
  },
  {
    message: 'Cable sent date must be after or equal to cable in date',
    path: ['initialCableSentDate']
  }
).refine(
  // Per Diem validation: Days must be > 0 if rate is entered
  (data) => {
    if (data.perDiem1Rate > 0 && data.perDiem1Days === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Number of days must be greater than 0 when per diem rate is entered',
    path: ['perDiem1Days']
  }
);
```

---

## State Management

### Context API Approach

```javascript
// src/store/FormContext.jsx
import React, { createContext, useContext, useState } from 'react';

const FormContext = createContext();

export function FormProvider({ children }) {
  const [referenceData, setReferenceData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <FormContext.Provider value={{
      referenceData,
      setReferenceData,
      isSubmitting,
      setIsSubmitting
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  return useContext(FormContext);
}
```

---

## Reference Data

### Loading Reference Data from Excel "List" Sheet

```javascript
// src/data/referenceData.json
[
  {
    "CITY/POST": "LUANDA",
    "COUNTRY": "ANGOLA",
    "BUREAU": "AF"
  },
  {
    "CITY/POST": "COTONOU",
    "COUNTRY": "BENIN",
    "BUREAU": "AF"
  },
  {
    "CITY/POST": "WARSAW",
    "COUNTRY": "POLAND",
    "BUREAU": "EUR"
  }
  // ... more entries
]
```

### Using Reference Data in Form

```jsx
// src/hooks/useReferenceData.js
import { useState, useEffect } from 'react';
import referenceData from '../data/referenceData.json';

export function useReferenceData() {
  const [posts, setPosts] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    // Load posts
    setPosts(referenceData.map(item => ({
      value: item['CITY/POST'],
      label: `${item['CITY/POST']}, ${item['COUNTRY']}`,
      country: item['COUNTRY'],
      bureau: item['BUREAU']
    })));

    // Get unique regions
    const uniqueRegions = [...new Set(referenceData.map(item => item['BUREAU']))];
    setRegions(uniqueRegions.map(r => ({ value: r, label: r })));
  }, []);

  const getRegionForPost = (post) => {
    const found = referenceData.find(item => item['CITY/POST'] === post);
    return found ? found['BUREAU'] : null;
  };

  return { posts, regions, getRegionForPost };
}
```

---

## Step-by-Step Implementation

### Phase 1: Project Setup (Day 1)

1. **Initialize React Project**
   ```bash
   npx create-react-app medevac-form
   cd medevac-form
   npm install react-hook-form zod @hookform/resolvers date-fns
   ```

2. **Set up folder structure** as shown in "Component Hierarchy" section

3. **Install UI library** (shadcn/ui recommended)
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add select
   npx shadcn-ui@latest add form
   ```

4. **Convert Excel reference data to JSON**
   - Export "List" worksheet to CSV
   - Convert to JSON format as shown in "Reference Data" section
   - Save as `src/data/referenceData.json`

### Phase 2: Core Components (Days 2-3)

1. **Create reusable form field components**
   - `Dropdown.jsx`
   - `CurrencyInput.jsx`
   - `DatePicker.jsx`
   - `NumberInput.jsx`
   - `CalculatedField.jsx`

2. **Implement calculation utilities**
   - Create `src/utils/calculations.js` with all calculation functions
   - Test each calculation function independently

3. **Create `useCalculations` hook**
   - Implement all calculations using `useMemo`
   - Test with sample data

### Phase 3: Form Sections (Days 4-6)

1. **Build Summary Section** (Columns B-R)
   - Display all calculated fields
   - Use `CalculatedField` component
   - Show real-time calculations

2. **Build Basic Info Section**
   - Patient name, agency type, traveler type
   - Home post dropdown with reference data
   - MEDEVAC type, route

3. **Build Initial Funding Section**
   - Date inputs (start, end, cable dates)
   - Per diem calculator (4 rates + days)
   - Airfare input
   - Additional travelers, misc expenses
   - Display calculated initial total

### Phase 4: Dynamic Sections (Days 7-9)

1. **Implement Amendment Section**
   - Conditional rendering (show/hide based on button)
   - Same structure as initial funding
   - "Add Amendment" button
   - "Remove Amendment" button

2. **Implement Extensions Manager**
   ```jsx
   // src/components/MEDEVACForm/ExtensionsManager.jsx
   import { useFieldArray } from 'react-hook-form';
   import ExtensionSection from './ExtensionSection';

   export default function ExtensionsManager() {
     const { fields, append, remove } = useFieldArray({
       name: 'extensions'
     });

     const addExtension = () => {
       if (fields.length < 10) {
         append({
           endDate: null,
           location: '',
           cableInDate: null,
           cableSentDate: null,
           bdEmployee: 'FS',
           perDiem1Rate: 0,
           perDiem1Days: 0,
           perDiem2Rate: 0,
           perDiem2Days: 0,
           perDiem3Rate: 0,
           perDiem3Days: 0,
           perDiem4Rate: 0,
           perDiem4Days: 0,
           airfare: 0,
           additionalTravelersPerDiem: 0,
           miscExpenses: 0
         });
       }
     };

     return (
       <div className="extensions-manager">
         <h2>Extensions</h2>
         {fields.map((field, index) => (
           <ExtensionSection
             key={field.id}
             index={index}
             onRemove={() => remove(index)}
           />
         ))}
         {fields.length < 10 && (
           <button type="button" onClick={addExtension}>
             + Add Extension
           </button>
         )}
       </div>
     );
   }
   ```

### Phase 5: Validation & Testing (Days 10-11)

1. **Implement form validation**
   - Add Zod schema
   - Test all validation rules
   - Display error messages

2. **Test calculations**
   - Create test cases for all calculations
   - Verify against Excel formulas
   - Test edge cases (empty values, negative numbers, etc.)

3. **Cross-browser testing**
   - Test in Chrome, Firefox, Safari, Edge
   - Test date pickers across browsers
   - Test currency formatting

### Phase 6: Finalization (Days 12-14)

1. **Implement form submission**
   - Create API endpoint (or local storage for testing)
   - Handle success/error states
   - Show confirmation message

2. **Add completion section**
   - Final accounting fields
   - Actual dates
   - Deobligation calculation
   - Comments textarea

3. **Styling & UX polish**
   - Responsive design
   - Loading states
   - Accessibility (ARIA labels, keyboard navigation)
   - Print stylesheet

4. **Documentation**
   - User guide
   - Developer documentation
   - Deployment instructions

---

## Additional Features to Consider

### 1. Auto-Save Draft
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('medevac-draft', JSON.stringify(formData));
  }, 5000); // Auto-save every 5 seconds

  return () => clearTimeout(timer);
}, [formData]);
```

### 2. Export to Excel
```javascript
import * as XLSX from 'xlsx';

function exportToExcel(formData, calculated) {
  const worksheet = XLSX.utils.json_to_sheet([{
    'Obligation Number': calculated.obligationNumber,
    'Patient Name': formData.patientName,
    'Total Obligation': calculated.totalObligation,
    // ... more fields
  }]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MEDEVAC');
  XLSX.writeFile(workbook, 'MEDEVAC_Export.xlsx');
}
```

### 3. Print View
```css
@media print {
  .no-print {
    display: none;
  }

  .calculated-field {
    border: 1px solid #ccc;
    padding: 8px;
  }
}
```

### 4. Field-Level Help Text
```jsx
<Tooltip content="Enter the per diem rate (Lodging + M&IE)">
  <InfoIcon />
</Tooltip>
```

---

## Troubleshooting Common Issues

### Issue 1: Calculated Fields Not Updating
**Solution**: Ensure dependencies are correctly specified in `useMemo` and `useEffect` hooks.

### Issue 2: Date Picker Format Issues
**Solution**: Use `date-fns` consistently for all date operations. Store dates as Date objects, not strings.

### Issue 3: Currency Rounding Errors
**Solution**: Use `Math.round(value * 100) / 100` or a library like `decimal.js` for precise currency calculations.

### Issue 4: Extensions Not Re-rendering
**Solution**: Use unique `key` prop in mapped components (use `field.id` from `useFieldArray`).

---

## Performance Optimization

1. **Memoize Calculations**: Use `useMemo` for expensive calculations
2. **Lazy Load Sections**: Use `React.lazy()` for large sections
3. **Debounce Input**: Debounce per diem calculations
4. **Virtual Scrolling**: If displaying many historical records

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints secured
- [ ] Form data validation on backend
- [ ] Error logging setup (Sentry, etc.)
- [ ] Performance monitoring (Lighthouse, Web Vitals)
- [ ] Accessibility audit (WAVE, axe)
- [ ] Security audit (OWASP checklist)
- [ ] User acceptance testing
- [ ] Documentation complete
- [ ] Backup strategy for data
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] CDN setup for static assets

---

## Resources

- **React Hook Form**: https://react-hook-form.com/
- **Zod Validation**: https://zod.dev/
- **date-fns**: https://date-fns.org/
- **shadcn/ui**: https://ui.shadcn.com/
- **Excel Formula Reference**: Refer to "MEDEVAC for Form.md" for detailed business rules

---

## Support & Maintenance

For questions or issues during implementation:
1. Review the Excel file formulas in the "FY2023 MEDEVAC Tracker" sheet
2. Consult the "MEDEVAC for Form.md" for business rules
3. Check the calculation functions in `src/utils/calculations.js`
4. Test calculations against Excel to verify accuracy

---

**Last Updated**: November 10, 2025
**Version**: 1.0
