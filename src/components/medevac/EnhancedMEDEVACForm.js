import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import ErrorBoundary from "../ui/ErrorBoundary";
import { Save, Download, Heart, Shield, HelpCircle, ChevronLeft, ChevronRight, Navigation, CheckCircle, AlertTriangle, ArrowUp } from "lucide-react";

import BasicInformation from "./BasicInformation";
import InitialFunding from "./InitialFunding";
import ExtensionsSection from "./ExtensionsSection";
import CompletionSection from "./CompletionSection";
import useMEDEVACForm from "../../hooks/useMEDEVACForm";
import { getValidationStatus } from "../../utils/formValidation";

const EnhancedMEDEVACForm = () => {
  const { formData, updateForm, calculatedValues, saveForm, exportForm } = useMEDEVACForm();
  const [currentSection, setCurrentSection] = useState('basic');

  // Memoize validation status to prevent unnecessary recalculations
  const validationStatus = useMemo(() => 
    getValidationStatus(formData), 
    [formData]
  );

  const handleSave = useCallback(() => {
    const savedData = saveForm();
    alert('Enhanced MEDEVAC request saved successfully!');
    return savedData;
  }, [saveForm]);

  const handleExport = useCallback(() => {
    exportForm();
  }, [exportForm]);

  const sections = [
    { id: 'basic', label: 'Basic Information', icon: Heart, required: true },
    { id: 'funding', label: 'Initial Funding', icon: Shield, required: true },
    { id: 'extensions', label: 'Extensions (E1-E10)', icon: Shield, required: false },
    { id: 'completion', label: 'Completion & Accounting', icon: Shield, required: false }
  ];

  const handleSectionChange = (sectionId) => {
    setCurrentSection(sectionId);
    // Smooth scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentSectionIndex = () => {
    return sections.findIndex(s => s.id === currentSection);
  };

  const canGoPrevious = () => {
    return getCurrentSectionIndex() > 0;
  };

  const canGoNext = () => {
    return getCurrentSectionIndex() < sections.length - 1;
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex > 0) {
      handleSectionChange(sections[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex < sections.length - 1) {
      handleSectionChange(sections[currentIndex + 1].id);
    }
  };

  // Optimized props to pass to form sections
  const sectionProps = useMemo(() => ({
    formData,
    updateForm,
    calculatedValues
  }), [formData, updateForm, calculatedValues]);

  const renderCurrentSection = useCallback(() => {
    const props = { 
      formData, 
      setFormData: (updater) => {
        if (typeof updater === 'function') {
          const newData = updater(formData);
          Object.keys(newData).forEach(key => {
            if (newData[key] !== formData[key]) {
              updateForm(key, newData[key]);
            }
          });
        } else {
          console.warn('setFormData called with non-function:', updater);
        }
      }
    };
    
    switch (currentSection) {
      case 'basic':
        return <BasicInformation {...props} />;
      case 'funding':
        return <InitialFunding {...props} />;
      case 'extensions':
        return <ExtensionsSection {...props} />;
      case 'completion':
        return <CompletionSection {...props} />;
      default:
        return <BasicInformation {...props} />;
    }
  }, [currentSection, formData, updateForm]);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Header Card with Navigation */}
      <Card className="shadow-theme-xl border border-theme-border-primary">
        <CardHeader className="bg-gradient-to-r from-matisse to-smalt text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-white" />
              <div>
                <CardTitle className="text-xl">Enhanced MEDEVAC Request Form</CardTitle>
                <p className="text-blue-100 text-sm mt-1">
                  Comprehensive medical evacuation coordination system
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white text-matisse">
                {formData.obligationNumber || 'Not Generated'}
              </Badge>
              <Badge 
                variant="outline" 
                className="border-white text-white"
              >
                {formData.medevacStatus}
              </Badge>
              <Badge 
                variant="outline"
                className={`border-white text-white flex items-center space-x-1 ${
                  validationStatus.isValid 
                    ? 'bg-green-500/20 border-green-300' 
                    : 'bg-yellow-500/20 border-yellow-300'
                }`}
              >
                {validationStatus.isValid ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                <span>{validationStatus.completionPercentage}% Complete</span>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  variant={currentSection === section.id ? "default" : "outline"}
                  className={`flex items-center space-x-2 ${
                    currentSection === section.id
                      ? "bg-matisse hover:bg-smalt text-white"
                      : "border-matisse text-matisse hover:bg-matisse hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                  {section.required && (
                    <span className="text-alizarin-crimson">*</span>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Form Progress</span>
              <div className="flex items-center gap-3">
                <span>Step {sections.findIndex(s => s.id === currentSection) + 1} of {sections.length}</span>
                <Link to="/instructions">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white flex items-center gap-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Need Help?
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-matisse h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((sections.findIndex(s => s.id === currentSection) + 1) / sections.length) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Section Content */}
      {renderCurrentSection()}

      {/* Bottom Navigation */}
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <Button
              onClick={handlePrevious}
              disabled={!canGoPrevious()}
              variant="outline"
              className={`flex items-center space-x-2 ${
                canGoPrevious()
                  ? "border-matisse text-matisse hover:bg-matisse hover:text-white"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
              {canGoPrevious() && (
                <span className="hidden sm:inline text-sm">
                  ({sections[getCurrentSectionIndex() - 1].label})
                </span>
              )}
            </Button>

            {/* Section Indicator */}
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-matisse" />
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {sections[getCurrentSectionIndex()].label}
                </div>
                <div className="text-xs text-gray-500">
                  Step {getCurrentSectionIndex() + 1} of {sections.length}
                </div>
              </div>
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              variant={canGoNext() ? "default" : "outline"}
              className={`flex items-center space-x-2 ${
                canGoNext()
                  ? "bg-matisse hover:bg-smalt text-white"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <span>Next</span>
              {canGoNext() && (
                <span className="hidden sm:inline text-sm">
                  ({sections[getCurrentSectionIndex() + 1].label})
                </span>
              )}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Optional: Quick section navigation dots */}
          <div className="flex justify-center mt-4 space-x-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  currentSection === section.id
                    ? "bg-matisse"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                title={section.label}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="shadow-theme-lg border border-theme-border-primary">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSave}
              className="bg-matisse hover:bg-smalt text-white flex-1 py-3"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Enhanced MEDEVAC Request
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-gold-accent text-black-pearl hover:bg-gold-accent hover:text-white flex-1 py-3"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Enhanced Data
            </Button>
          </div>

          {/* Enhanced Form Summary - calculated fields */}
          <div className="mt-6 pt-6 border-t">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Calculated Fields</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-2 bg-gray-50 rounded border-l-2 border-gray-400">
                  <p className="text-xs text-gray-600">MEDEVAC Status</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {formData.medevacStatus || 'N/A'}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded border-l-2 border-gray-400">
                  <p className="text-xs text-gray-600">Cable Status</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {typeof formData.cableStatus === 'number' ? `${formData.cableStatus} days` : formData.cableStatus}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded border-l-2 border-gray-400">
                  <p className="text-xs text-gray-600">Obligation Number</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {formData.obligationNumber || 'Auto-generated'}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded border-l-2 border-gray-400">
                  <p className="text-xs text-gray-600">Region</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {formData.region || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Patient Name</p>
                <p className="font-semibold text-black-pearl text-sm">
                  {formData.patientName || 'Not set'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600">Total Obligation</p>
                <p className="font-semibold text-green-700 text-sm">
                  ${(formData.totalObligation || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-600">Current Location</p>
                <p className="font-semibold text-black-pearl text-sm">
                  {formData.currentMedevacLocation || formData.initialMedevacLocation || 'Not set'}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600">Extensions</p>
                <p className="font-semibold text-black-pearl text-sm">
                  {(formData.extensions || []).length} of 10
                </p>
              </div>
            </div>
            
            {/* Additional calculated metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-3">
              <div className="p-2 bg-indigo-50 rounded">
                <p className="text-xs text-gray-600">Effective Start</p>
                <p className="font-medium text-indigo-700 text-xs">
                  {formData.effectiveStartDate || 'Not set'}
                </p>
              </div>
              <div className="p-2 bg-indigo-50 rounded">
                <p className="text-xs text-gray-600">Effective End</p>
                <p className="font-medium text-indigo-700 text-xs">
                  {formData.effectiveEndDate || 'Not set'}
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <p className="text-xs text-gray-600">Amendments</p>
                <p className="font-medium text-orange-700 text-xs">
                  {formData.numberOfAmendments || 0}
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <p className="text-xs text-gray-600">Extension Days</p>
                <p className="font-medium text-orange-700 text-xs">
                  {formData.extensionDuration || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedMEDEVACForm;