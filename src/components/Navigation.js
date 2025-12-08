import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ui/ThemeToggle';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  GlobeAmericasIcon, 
  CurrencyDollarIcon, 
  BookOpenIcon,
  FolderIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import MedFlagLogo from "../assets/images/logos/med-flag-logo-horizontal-white.svg";

export default function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const allNavItems = [
    { path: '/', label: 'Home', icon: HomeIcon, requiresAuth: false },
    { path: '/form', label: 'MEDEVAC Form', icon: DocumentTextIcon, requiresAuth: true },
    { path: '/management', label: 'Manage Submissions', icon: ChartPieIcon, requiresAuth: true },
    { path: '/admin/requests', label: 'Access Requests', icon: ShieldCheckIcon, requiresAuth: true },
    { path: '/dashboard', label: 'Analytics', icon: ChartBarIcon, requiresAuth: true },
    { path: '/post-data', label: 'Post Data', icon: GlobeAmericasIcon, requiresAuth: true },
    { path: '/scraper', label: 'Per Diem Scraper', icon: CurrencyDollarIcon, requiresAuth: true },
    { path: '/instructions', label: 'Instructions', icon: BookOpenIcon, requiresAuth: true },
    { path: '/documentation', label: 'Documentation', icon: FolderIcon, requiresAuth: true }
  ];

  const navItems = allNavItems.filter(item => {
    // Hide Home when logged in
    if (item.path === '/' && isAuthenticated) return false;
    // Show items that don't require auth, or user is authenticated
    return !item.requiresAuth || isAuthenticated;
  });

  return (
    <>
      {/* Clean Government Header */}
      <div className="bg-gradient-to-r from-black-pearl via-gray-900 to-black-pearl text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <img 
                src={MedFlagLogo} 
                alt="U.S. Department of State - Medical Evacuation Services" 
                className="h-8 w-auto"
              />
              <div className="hidden sm:block">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="w-5 h-5 text-gold-accent" />
                  <div>
                    <div className="text-base font-bold font-garamond">
                      U.S. Department of State
                    </div>
                    <div className="text-xs text-gold-accent font-open-sans -mt-0.5">
                      Medical Evacuation Services
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="hidden lg:flex items-center">
              <ThemeToggle variant="ghost" />
            </div>
          </div>
        </div>
      </div>

      {/* Clean Navigation Bar */}
      <div className="bg-theme-bg-primary shadow-theme-md border-t-2 border-gold-accent sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-0">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      group relative flex items-center space-x-3 px-5 py-4 text-sm font-semibold transition-all duration-300
                      ${isActive 
                        ? 'text-theme-text-primary bg-theme-bg-secondary' 
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary'
                      }
                    `}
                  >
                    {/* Active top border */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-matisse"></div>
                    )}
                    
                    <IconComponent className={`
                      w-5 h-5 transition-colors duration-300
                      ${isActive 
                        ? 'text-matisse' 
                        : 'text-gray-400 group-hover:text-matisse'
                      }
                    `} />
                    
                    <span className="font-open-sans">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-theme-bg-secondary rounded-lg">
                    <UserIcon className="w-4 h-4 text-theme-text-secondary" />
                    <span className="text-sm text-theme-text-primary font-medium">
                      {user.name || user.email || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden w-full flex justify-end items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-3 rounded-lg text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-secondary transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
              <div /> {/* Spacer for center alignment */}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 py-3 space-y-1 bg-gray-50 border-t border-gray-200">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200
                    ${isActive 
                      ? 'bg-matisse text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-white hover:text-black-pearl'
                    }
                  `}
                >
                  <IconComponent className={`
                    w-5 h-5
                    ${isActive 
                      ? 'text-white' 
                      : 'text-gray-400 group-hover:text-matisse'
                    }
                  `} />
                  <span className="font-open-sans">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}