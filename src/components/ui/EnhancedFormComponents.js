import React, { useState, memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AlertCircle, CheckCircle2, Clock, Save, Eye, EyeOff, Info, Zap } from "lucide-react";

// Enhanced form field component with better UX
const FormField = memo(({ 
  label, 
  value, 
  onChange, 
  type = "text",
  required = false,
  disabled = false,
  placeholder,
  helpText,
  error,
  success,
  className = ""
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className={`form-field-container ${className}`}>
      {/* Enhanced Label with Visual Indicators */}
      <div className="flex items-center justify-between mb-2">
        <Label className={`text-sm font-medium transition-colors duration-200 ${
          focused ? 'text-matisse' : 'text-gray-700'
        } ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}>
          {label}
        </Label>
        
        {/* Interactive Help Icon */}
        {helpText && (
          <button
            type="button"
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-matisse transition-colors duration-200"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Enhanced Input with Visual States */}
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            transition-all duration-200 pr-10
            ${focused ? 'ring-2 ring-matisse/20 border-matisse shadow-sm' : ''}
            ${error ? 'border-red-500 ring-2 ring-red-100' : ''}
            ${success ? 'border-green-500 ring-2 ring-green-100' : ''}
            ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-70' : ''}
          `}
        />
        
        {/* Status Icons */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {error && <AlertCircle className="h-4 w-4 text-red-500" />}
          {success && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </div>
      </div>

      {/* Help Text Tooltip */}
      {showHelp && helpText && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 animate-in slide-in-from-top-1 duration-200">
          {helpText}
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {success && (
        <p className="mt-1 text-sm text-green-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
          <CheckCircle2 className="h-3 w-3" />
          {success}
        </p>
      )}
    </div>
  );
});

// Enhanced Progress Bar Component
const ProgressBar = memo(({ currentStep, totalSteps, completionPercentage, validationStatus }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Progress</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Step {currentStep + 1} of {totalSteps}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            completionPercentage === 100 ? 'bg-green-100 text-green-700' : 
            completionPercentage >= 75 ? 'bg-blue-100 text-blue-700' :
            completionPercentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {completionPercentage === 100 ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Zap className="h-3 w-3" />
            )}
            {completionPercentage}%
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out relative ${
              completionPercentage === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
              completionPercentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
              completionPercentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          >
            {/* Animated shine effect */}
            {completionPercentage > 0 && completionPercentage < 100 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            )}
          </div>
        </div>

        {/* Step Markers */}
        <div className="absolute top-0 w-full h-full flex justify-between items-center">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                index <= currentStep ? 'bg-white border-current' : 'bg-gray-200 border-gray-300'
              }`}
              style={{ marginLeft: index === 0 ? '0' : '-6px', marginRight: index === totalSteps - 1 ? '0' : '-6px' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// Smart Save Indicator
const SaveIndicator = memo(({ lastSaved, unsavedChanges, isAutoSaving }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isAutoSaving ? (
        <div className="flex items-center gap-1 text-blue-600">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Saving...</span>
        </div>
      ) : unsavedChanges ? (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertCircle className="h-3 w-3" />
          <span>Unsaved changes</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          <span>All changes saved</span>
          {lastSaved && (
            <span className="text-gray-500 text-xs">
              • {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
ProgressBar.displayName = 'ProgressBar';
SaveIndicator.displayName = 'SaveIndicator';

export { FormField, ProgressBar, SaveIndicator };