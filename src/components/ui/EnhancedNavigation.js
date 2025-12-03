import React, { memo, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Clock, Bookmark } from "lucide-react";

// Enhanced Section Navigation with better UX
const SectionNavigation = memo(({ 
  sections, 
  currentSection, 
  onSectionChange, 
  validationErrors = {},
  completionStatus = {}
}) => {
  const [hoveredSection, setHoveredSection] = useState(null);

  const getSectionStatus = (sectionId) => {
    const hasErrors = validationErrors[sectionId] && Object.keys(validationErrors[sectionId]).length > 0;
    const isComplete = completionStatus[sectionId] === 100;
    
    if (hasErrors) return 'error';
    if (isComplete) return 'complete';
    if (completionStatus[sectionId] > 0) return 'inProgress';
    return 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'inProgress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColors = (sectionId, status, isActive) => {
    if (isActive) {
      return "bg-matisse hover:bg-smalt text-white border-matisse";
    }
    
    switch (status) {
      case 'complete':
        return "border-green-300 text-green-700 bg-green-50 hover:bg-green-100";
      case 'error':
        return "border-red-300 text-red-700 bg-red-50 hover:bg-red-100";
      case 'inProgress':
        return "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100";
      default:
        return "border-gray-300 text-gray-600 bg-gray-50 hover:bg-gray-100";
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {sections.map((section, index) => {
        const Icon = section.icon;
        const status = getSectionStatus(section.id);
        const isActive = currentSection === section.id;
        const isHovered = hoveredSection === section.id;
        
        return (
          <div key={section.id} className="relative">
            <Button
              onClick={() => onSectionChange(section.id)}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              variant="outline"
              className={`
                flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 border-2
                ${getStatusColors(section.id, status, isActive)}
                ${isHovered && !isActive ? 'transform scale-105 shadow-md' : ''}
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{section.label}</span>
              {section.required && !isActive && (
                <span className="text-red-500 text-sm">*</span>
              )}
              {getStatusIcon(status)}
            </Button>
            
            {/* Step Number Indicator */}
            <div className={`
              absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
              ${isActive ? 'bg-matisse text-white' : 'bg-gray-300 text-gray-600'}
            `}>
              {index + 1}
            </div>

            {/* Completion Percentage Indicator */}
            {completionStatus[section.id] > 0 && completionStatus[section.id] < 100 && (
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${completionStatus[section.id] || 0}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

// Enhanced Bottom Navigation with better context
const BottomNavigation = memo(({ 
  sections, 
  currentSection, 
  canGoPrevious, 
  canGoNext, 
  onPrevious, 
  onNext,
  onSectionChange,
  formStats = {}
}) => {
  const getCurrentSectionIndex = () => 
    sections.findIndex(s => s.id === currentSection);

  const currentIndex = getCurrentSectionIndex();
  const previousSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <Button
          onClick={onPrevious}
          disabled={!canGoPrevious()}
          variant="outline"
          className={`flex items-center space-x-2 px-6 py-3 ${
            canGoPrevious()
              ? "border-matisse text-matisse hover:bg-matisse hover:text-white"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">Previous</div>
            {previousSection && (
              <div className="text-xs opacity-75">{previousSection.label}</div>
            )}
          </div>
        </Button>

        {/* Center: Current Section Info + Quick Nav */}
        <div className="flex flex-col items-center space-y-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {sections[currentIndex].label}
            </div>
            <div className="text-sm text-gray-500">
              Step {currentIndex + 1} of {sections.length}
            </div>
          </div>
          
          {/* Quick Navigation Dots */}
          <div className="flex space-x-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200 relative
                  ${currentSection === section.id ? 'bg-matisse transform scale-125' : 'bg-gray-300 hover:bg-gray-400'}
                `}
                title={`${section.label} (${index + 1}/${sections.length})`}
              >
                {/* Completion ring */}
                {formStats[section.id]?.completion > 0 && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500"
                       style={{ 
                         background: `conic-gradient(#3b82f6 ${(formStats[section.id]?.completion || 0) * 3.6}deg, transparent 0deg)` 
                       }} 
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <Button
          onClick={onNext}
          disabled={!canGoNext()}
          variant={canGoNext() ? "default" : "outline"}
          className={`flex items-center space-x-2 px-6 py-3 ${
            canGoNext()
              ? "bg-matisse hover:bg-smalt text-white"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <div className="text-right">
            <div className="font-medium">
              {nextSection ? 'Next' : 'Complete'}
            </div>
            {nextSection && (
              <div className="text-xs opacity-75">{nextSection.label}</div>
            )}
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

// Smart Floating Action Button for Save/Help
const FloatingActions = memo(({ 
  onSave, 
  onHelp, 
  showHelp = false,
  saveStatus = 'idle', // idle, saving, saved, error
  scrollToTop
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* Help Button */}
      <Button
        onClick={onHelp}
        className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        ?
      </Button>
      
      {/* Scroll to Top */}
      <Button
        onClick={scrollToTop}
        className="w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white shadow-lg"
      >
        ↑
      </Button>

      {/* Save Button */}
      <Button
        onClick={onSave}
        disabled={saveStatus === 'saving'}
        className={`
          w-12 h-12 rounded-full shadow-lg relative overflow-hidden
          ${saveStatus === 'saved' ? 'bg-green-500 hover:bg-green-600' : 'bg-matisse hover:bg-smalt'}
          text-white
        `}
      >
        {saveStatus === 'saving' ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : saveStatus === 'saved' ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Bookmark className="h-5 w-5" />
        )}
      </Button>

      {/* Tooltip */}
      {showTooltip && showHelp && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
          Need help? Click for instructions
        </div>
      )}
    </div>
  );
});

SectionNavigation.displayName = 'SectionNavigation';
BottomNavigation.displayName = 'BottomNavigation';
FloatingActions.displayName = 'FloatingActions';

export { SectionNavigation, BottomNavigation, FloatingActions };