import { useState, useMemo, useCallback } from "react";
import {
  generateObligationNumber,
  calculateMEDEVACStatus,
  calculateCableStatus,
  calculateTotalObligation,
  calculateEffectiveStartDate,
  calculateEffectiveEndDate,
  calculateCurrentMEDEVACLocation,
  getRegionFromPost,
  calculateNumberOfAmendments,
  calculateExtensionDuration
} from "../utils/businessLogic";

// Initial form data structure
const initialFormData = {
  // Basic Information
  obligationNumber: '',
  patientName: '',
  agencyType: '',
  medevacType: '',
  travelerType: '',
  region: '',
  homePost: '',
  route: '',
  initialMedevacLocation: '',
  currentMedevacLocation: '',

  // Status fields (calculated)
  medevacStatus: 'Initiated',
  cableStatus: 'N/A',
  totalObligation: 0,
  effectiveStartDate: '',
  effectiveEndDate: '',
  numberOfAmendments: 0,
  extensionDuration: 0,

  // Initial Funding
  initialStartDate: '',
  initialEndDate: '',
  fundingCableInDate: '',
  fundingCableSentDate: '',
  bdEmployee: '',
  employeeResponseTime: 0,
  
  // Per Diem
  perDiemRates: [{ rate: 0, days: 0, id: 1 }],
  airfare: 0,
  totalPerDiemAdditionalTravelers: 0,
  miscExpenses: 0,
  totalPerDiemPatient: 0,
  totalPerDiem: 0,
  initialFundingTotal: 0,

  // Extensions
  extensions: [],
  totalExtensionFunding: 0,

  // Completion (phase 5)
  completionStatus: '',
  actualStartDate: '',
  actualEndDate: '',
  airfareApproved: 0,
  perDiemApproved: 0,
  comments: ''
};

export const useMEDEVACForm = () => {
  const [formData, setFormData] = useState(initialFormData);

  // Memoize expensive calculations to prevent unnecessary re-computation
  const calculatedValues = useMemo(() => ({
    // Generate obligation number if agency type is set and obligation number is empty
    obligationNumber: (!formData.obligationNumber && formData.agencyType) 
      ? generateObligationNumber(formData.agencyType) 
      : formData.obligationNumber,
    
    // Calculate status and totals
    medevacStatus: calculateMEDEVACStatus(formData),
    cableStatus: calculateCableStatus(formData.fundingCableInDate, formData.fundingCableSentDate),
    totalObligation: calculateTotalObligation(formData),
    
    // Calculate effective dates
    effectiveStartDate: calculateEffectiveStartDate(formData),
    effectiveEndDate: calculateEffectiveEndDate(formData),
    
    // Calculate location and region
    currentMedevacLocation: calculateCurrentMEDEVACLocation(formData),
    region: getRegionFromPost(formData.homePost),
    
    // Calculate counts and durations
    numberOfAmendments: calculateNumberOfAmendments(formData),
    extensionDuration: calculateExtensionDuration(formData),
    
    // Extension funding total
    totalExtensionFunding: (formData.extensions || []).reduce((total, ext) => total + (ext.extensionFundingTotal || 0), 0)
  }), [
    formData
  ]);

  // Update form data with calculated values (object updates)
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Update individual form field (field, value updates)
  const updateForm = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Merge calculated values with form data
  const mergedFormData = useMemo(() => ({
    ...formData,
    ...calculatedValues
  }), [formData, calculatedValues]);

  // Form actions
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const saveForm = useCallback(async (isDraft = true) => {
    try {
      const MedevacService = (await import('../services/MedevacService')).default;
      
      // Get current user from localStorage
      const savedUser = localStorage.getItem('medevac_user');
      let userId = null;
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          userId = user.id;
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
      
      const medevacData = {
        ...mergedFormData,
        userId: userId,
        status: isDraft ? 'draft' : 'submitted',
        savedAt: new Date().toISOString()
      };
      
      let result;
      if (mergedFormData.id && mergedFormData.id !== Date.now()) {
        // Update existing submission (if it has a server-generated ID)
        result = await MedevacService.updateSubmission(mergedFormData.id, medevacData);
      } else {
        // Create new submission
        result = await MedevacService.createSubmission(medevacData);
        // Update form data with the new ID
        updateFormData(prev => ({ ...prev, id: result.id }));
      }
      
      // Also save to localStorage as backup
      const existingData = JSON.parse(localStorage.getItem('medevacSubmissions') || '[]');
      const existingIndex = existingData.findIndex(item => item.id === result.id);
      if (existingIndex >= 0) {
        existingData[existingIndex] = result.submission;
      } else {
        existingData.push(result.submission);
      }
      localStorage.setItem('medevacSubmissions', JSON.stringify(existingData));
      
      return result;
    } catch (error) {
      console.error('Error saving form:', error);
      // Fallback to localStorage if API fails
      const medevacData = {
        ...mergedFormData,
        submittedAt: new Date().toISOString(),
        id: mergedFormData.id || Date.now()
      };
      
      const existingData = JSON.parse(localStorage.getItem('medevacSubmissions') || '[]');
      existingData.push(medevacData);
      localStorage.setItem('medevacSubmissions', JSON.stringify(existingData));
      
      throw error;
    }
  }, [mergedFormData, updateFormData]);

  const loadForm = useCallback(async (id) => {
    try {
      const MedevacService = (await import('../services/MedevacService')).default;
      const submission = await MedevacService.getSubmission(id);
      
      // Load the form data
      setFormData(submission);
      updateFormData(submission);
      
      return submission;
    } catch (error) {
      console.error('Error loading form:', error);
      throw error;
    }
  }, [setFormData, updateFormData]);

  const submitForm = useCallback(async () => {
    return await saveForm(false); // Submit as final, not draft
  }, [saveForm]);

  const exportForm = useCallback(() => {
    const dataToExport = {
      ...mergedFormData,
      exportDate: new Date().toISOString()
    };
    
    const csvContent = Object.entries(dataToExport)
      .map(([key, value]) => `${key},${JSON.stringify(value)}`)
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced-medevac-${mergedFormData.obligationNumber || Date.now()}.csv`;
    a.click();
    
    // Cleanup URL object to prevent memory leaks
    window.URL.revokeObjectURL(url);
  }, [mergedFormData]);

  return {
    formData: mergedFormData,
    updateForm,
    updateFormData,
    setFormData: updateFormData,
    resetForm,
    saveForm,
    loadForm,
    submitForm,
    exportForm,
    calculatedValues
  };
};

export default useMEDEVACForm;