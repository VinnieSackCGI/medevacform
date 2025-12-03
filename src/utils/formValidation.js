/**
 * Form validation utilities for MEDEVAC form
 */

// Validation rules for required fields
export const REQUIRED_FIELDS = {
  basic: [
    'patientName',
    'employeeId', 
    'homePost',
    'agencyType'
  ],
  funding: [
    'initialStartDate',
    'initialEndDate',
    'initialFundingTotal'
  ]
};

// Validation functions
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'number') {
    return !isNaN(value) && value > 0;
  }
  return value !== null && value !== undefined;
};

export const validateEmail = (email) => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateDate = (dateString) => {
  if (!dateString) return true; // Optional field
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date > new Date('1900-01-01');
};

export const validateCurrency = (value) => {
  if (!value) return true; // Optional field
  const numValue = parseFloat(value);
  return !isNaN(numValue) && numValue >= 0;
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return true;
  return new Date(startDate) <= new Date(endDate);
};

// Form section validation
export const validateSection = (sectionId, formData) => {
  const errors = {};
  const requiredFields = REQUIRED_FIELDS[sectionId] || [];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!validateRequired(formData[field])) {
      errors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
    }
  });
  
  // Specific validations
  if (sectionId === 'basic') {
    if (formData.contactEmail && !validateEmail(formData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }
  }
  
  if (sectionId === 'funding') {
    if (!validateDate(formData.initialStartDate)) {
      errors.initialStartDate = 'Please enter a valid start date';
    }
    
    if (!validateDate(formData.initialEndDate)) {
      errors.initialEndDate = 'Please enter a valid end date';
    }
    
    if (formData.initialStartDate && formData.initialEndDate && 
        !validateDateRange(formData.initialStartDate, formData.initialEndDate)) {
      errors.dateRange = 'End date must be after start date';
    }
    
    if (!validateCurrency(formData.initialFundingTotal)) {
      errors.initialFundingTotal = 'Please enter a valid funding amount';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Complete form validation
export const validateForm = (formData) => {
  const allErrors = {};
  let isFormValid = true;
  
  // Validate each section
  Object.keys(REQUIRED_FIELDS).forEach(sectionId => {
    const sectionValidation = validateSection(sectionId, formData);
    if (!sectionValidation.isValid) {
      allErrors[sectionId] = sectionValidation.errors;
      isFormValid = false;
    }
  });
  
  return {
    isValid: isFormValid,
    errors: allErrors,
    errorCount: Object.values(allErrors).reduce((count, sectionErrors) => 
      count + Object.keys(sectionErrors).length, 0
    )
  };
};

// Get validation status for display
export const getValidationStatus = (formData) => {
  const validation = validateForm(formData);
  
  return {
    ...validation,
    completionPercentage: calculateCompletionPercentage(formData),
    canSubmit: validation.isValid && isFormReadyForSubmission(formData)
  };
};

// Calculate form completion percentage
export const calculateCompletionPercentage = (formData) => {
  const allRequiredFields = Object.values(REQUIRED_FIELDS).flat();
  const completedFields = allRequiredFields.filter(field => 
    validateRequired(formData[field])
  );
  
  return Math.round((completedFields.length / allRequiredFields.length) * 100);
};

// Check if form is ready for submission
export const isFormReadyForSubmission = (formData) => {
  const validation = validateForm(formData);
  return validation.isValid && formData.patientName && formData.initialFundingTotal;
};

// Format validation errors for display
export const formatValidationErrors = (errors) => {
  const formattedErrors = [];
  
  Object.entries(errors).forEach(([sectionId, sectionErrors]) => {
    Object.entries(sectionErrors).forEach(([field, message]) => {
      formattedErrors.push({
        section: sectionId,
        field,
        message
      });
    });
  });
  
  return formattedErrors;
};