import React, { useState } from 'react';
import { Info, HelpCircle, AlertCircle } from 'lucide-react';

// Tooltip wrapper component
export const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}>
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-lg">
            <div className="whitespace-pre-wrap">{content}</div>
            {/* Arrow */}
            <div className={`absolute w-0 h-0 ${
              position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900' :
              position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900' :
              position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900' :
              'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
            }`} />
          </div>
        </div>
      )}
    </div>
  );
};

// Information bubble icon with tooltip
export const InfoBubble = ({ 
  content, 
  icon = 'info', 
  size = 'sm', 
  position = 'top',
  className = ''
}) => {
  const icons = {
    info: Info,
    help: HelpCircle,
    alert: AlertCircle
  };

  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const IconComponent = icons[icon] || Info;

  return (
    <Tooltip content={content} position={position}>
      <IconComponent 
        className={`${sizes[size]} text-blue-500 hover:text-blue-700 transition-colors ${className}`} 
      />
    </Tooltip>
  );
};

// Field label with integrated help
export const FieldLabel = ({ 
  children, 
  htmlFor, 
  required = false, 
  helpText, 
  className = '' 
}) => {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
      <span className="flex items-center gap-2">
        {children}
        {required && <span className="text-red-500">*</span>}
        {helpText && (
          <InfoBubble 
            content={helpText} 
            size="sm" 
            position="right"
          />
        )}
      </span>
    </label>
  );
};

// Section header with help
export const SectionHeader = ({ 
  title, 
  description, 
  helpText, 
  className = '' 
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        {title}
        {helpText && (
          <InfoBubble 
            content={helpText} 
            size="md" 
            position="right"
          />
        )}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
};

// Help panel component for more detailed explanations
export const HelpPanel = ({ 
  title, 
  content, 
  isOpen, 
  onToggle, 
  type = 'info' 
}) => {
  const typeStyles = {
    info: 'border-blue-200 bg-blue-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
    success: 'border-green-200 bg-green-50'
  };

  const typeIcons = {
    info: Info,
    warning: AlertCircle,
    error: AlertCircle,
    success: HelpCircle
  };

  const IconComponent = typeIcons[type];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
      >
        <HelpCircle className="h-4 w-4" />
        Need help with this section?
      </button>
    );
  }

  return (
    <div className={`border rounded-lg p-4 mt-4 ${typeStyles[type]}`}>
      <div className="flex items-start gap-3">
        <IconComponent className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
          <div className="text-sm text-gray-700 prose prose-sm max-w-none">
            {typeof content === 'string' ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              content
            )}
          </div>
          <button
            onClick={onToggle}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Hide help
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick tips component
export const QuickTips = ({ tips, className = '' }) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-800 mb-2">Quick Tips</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default {
  Tooltip,
  InfoBubble,
  FieldLabel,
  SectionHeader,
  HelpPanel,
  QuickTips
};