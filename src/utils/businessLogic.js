// Business logic utilities for MEDEVAC form calculations
// Business logic for MEDEVAC tracker functionality

// Import comprehensive post data from PostData
import { POST_DATA } from '../pages/PostData';

export const generateObligationNumber = (agencyType, fiscalYear = null) => {
  // Format: YY[10|90]XXX
  // YY = Last 2 digits of fiscal year
  // 10 = DOS/Seabee cases, 90 = MSG cases
  // XXX = Sequential number (001-999)
  
  const currentYear = fiscalYear || new Date().getFullYear();
  const fy = currentYear.toString().slice(-2);
  
  let agencyCode;
  switch (agencyType) {
    case 'MSG':
      agencyCode = '90';
      break;
    case 'DOS':
    case 'Seabee':
    case 'DOS/Seabee':
      agencyCode = '10';
      break;
    default:
      agencyCode = '10';
  }
  
  // In a real app, this would get the next sequential number from database
  // For now, we'll generate a random 3-digit number
  const sequentialNumber = Math.floor(Math.random() * 999) + 1;
  const paddedNumber = sequentialNumber.toString().padStart(3, '0');
  
  return `${fy}${agencyCode}${paddedNumber}`;
};

export const calculateMEDEVACStatus = (formData) => {
  const { extensions = [], amendment, fundingCableInDate, fundingCableSentDate } = formData;
  
  // Check latest extension status
  if (extensions.length > 0) {
    const latestExtension = extensions[extensions.length - 1];
    const extensionNumber = extensions.length;
    
    if (latestExtension.fundingCableOutDate) {
      return `${extensionNumber}${extensionNumber === 1 ? 'st' : extensionNumber === 2 ? 'nd' : extensionNumber === 3 ? 'rd' : 'th'} Extension Funding Out`;
    } else if (latestExtension.fundingCableInDate) {
      return `${extensionNumber}${extensionNumber === 1 ? 'st' : extensionNumber === 2 ? 'nd' : extensionNumber === 3 ? 'rd' : 'th'} Extension In Processing`;
    }
  }
  
  // Check amendment status
  if (amendment) {
    if (amendment.fundingCableOutDate) {
      return 'Amendment Funding Out';
    } else if (amendment.fundingCableInDate) {
      return 'Amendment In Processing';
    }
  }
  
  // Check initial funding status
  if (fundingCableSentDate) {
    return 'Initial Funding Out';
  } else if (fundingCableInDate) {
    return 'Initial In Processing';
  }
  
  return 'Initiated';
};

export const calculateCableStatus = (cableInDate, cableOutDate) => {
  if (!cableInDate) return 'N/A';
  if (cableOutDate) return 'Sent';
  
  // Calculate days in processing
  const inDate = new Date(cableInDate);
  const today = new Date();
  const diffTime = Math.abs(today - inDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Calculate business days between two dates (excluding weekends)
export const calculateBusinessDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Ensure start is before end
  const fromDate = start <= end ? start : end;
  const toDate = start <= end ? end : start;
  
  let businessDays = 0;
  const currentDate = new Date(fromDate);
  
  while (currentDate <= toDate) {
    const dayOfWeek = currentDate.getDay();
    // 0 = Sunday, 6 = Saturday - exclude weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return businessDays;
};

export const calculateEmployeeResponseTime = (cableInDate, cableOutDate) => {
  if (!cableInDate || !cableOutDate) return 0;
  
  // Calculate business days instead of hours
  return calculateBusinessDays(cableInDate, cableOutDate);
};

export const calculateTotalObligation = (formData) => {
  const initialFunding = parseFloat(formData.initialFundingTotal) || 0;
  const amendmentFunding = formData.amendment ? (parseFloat(formData.amendment.amendmentFundingTotal) || 0) : 0;
  const extensionFunding = (formData.extensions || []).reduce((total, ext) => {
    return total + (parseFloat(ext.extensionFundingTotal) || 0);
  }, 0);
  
  return initialFunding + amendmentFunding + extensionFunding;
};

export const calculateEffectiveStartDate = (formData) => {
  // Return amended start date if amendment exists, otherwise initial start date
  if (formData.amendment && formData.amendment.amendedStartDate) {
    return formData.amendment.amendedStartDate;
  }
  return formData.initialStartDate;
};

export const calculateEffectiveEndDate = (formData) => {
  // Return the latest end date from all extensions, amendment, or initial
  const dates = [];
  
  if (formData.initialEndDate) dates.push(new Date(formData.initialEndDate));
  if (formData.amendment && formData.amendment.amendedEndDate) {
    dates.push(new Date(formData.amendment.amendedEndDate));
  }
  
  (formData.extensions || []).forEach(ext => {
    if (ext.extensionEndDate) dates.push(new Date(ext.extensionEndDate));
  });
  
  if (dates.length === 0) return null;
  
  const latestDate = new Date(Math.max.apply(null, dates));
  return latestDate.toISOString().split('T')[0]; // Return as YYYY-MM-DD
};

export const calculateCurrentMEDEVACLocation = (formData) => {
  // Return the latest location from extensions, amendment, or initial
  const { extensions = [], amendment, initialMedevacLocation } = formData;
  
  if (extensions.length > 0) {
    const latestExtension = extensions[extensions.length - 1];
    if (latestExtension.medevacLocation) {
      return latestExtension.medevacLocation;
    }
  }
  
  if (amendment && amendment.medevacLocation) {
    return amendment.medevacLocation;
  }
  
  return initialMedevacLocation || '';
};

export const calculateNumberOfAmendments = (formData) => {
  return formData.amendment ? 1 : 0;
};

export const calculateExtensionDuration = (formData) => {
  const { extensions = [], initialEndDate } = formData;
  
  if (extensions.length === 0) return 0;
  
  const effectiveEndDate = calculateEffectiveEndDate(formData);
  const originalEndDate = initialEndDate;
  
  if (!effectiveEndDate || !originalEndDate) return 0;
  
  const endDate = new Date(effectiveEndDate);
  const origDate = new Date(originalEndDate);
  const diffTime = Math.abs(endDate - origDate);
  
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
};

// Generate alphabetically ordered reference data from comprehensive post database
const generateRegionsReference = () => {
  const regions = {};
  
  // Sort posts alphabetically and create region mapping
  POST_DATA
    .sort((a, b) => a.city.localeCompare(b.city))
    .forEach(post => {
      regions[post.city] = post.bureau;
    });
  
  return regions;
};

// Reference data for lookups (comprehensive post database - alphabetically organized)
export const REFERENCE_DATA = {
  regions: generateRegionsReference()
};

export const getRegionFromPost = (homePost) => {
  return REFERENCE_DATA.regions[homePost?.toUpperCase()] || 'Unknown';
};