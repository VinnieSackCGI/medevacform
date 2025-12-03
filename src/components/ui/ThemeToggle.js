import React, { memo } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './button';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = memo(({ variant = 'default', size = 'default', showLabel = false }) => {
  const { theme, toggleTheme, isDark, isLoading } = useTheme();

  if (isLoading) {
    return (
      <Button variant="ghost" size={size} disabled>
        <Monitor className="h-4 w-4" />
        {showLabel && <span className="ml-2">Theme</span>}
      </Button>
    );
  }

  const getIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Switch to Light Mode';
      case 'light':
        return 'Switch to Dark Mode';
      default:
        return 'Toggle Theme';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      title={getLabel()}
      className={`
        transition-all duration-200 hover:scale-105
        ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
      `}
    >
      <div className="transition-transform duration-300 hover:rotate-12">
        {getIcon()}
      </div>
      {showLabel && (
        <span className="ml-2">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </Button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;