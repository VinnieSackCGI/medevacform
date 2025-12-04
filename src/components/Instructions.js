import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Info, 
  FileText, 
  Calculator, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  Navigation,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Mail,
  BarChart3,
  Globe,
  TrendingUp,
  Filter,
  Plane,
  Heart,
  ChevronUp
} from 'lucide-react';

const Instructions = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-black-pearl text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">Enhanced MEDEVAC System Guide</h1>
          <p className="text-slate-300">Complete guide for analytics dashboard, world map, and case management system</p>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('getting-started')}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Getting Started
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('dashboard-guide')}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('world-map-guide')}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                <Globe className="h-5 w-5" />
                World Map
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('form-sections')}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Form Sections
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('data-entry')}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                <Database className="h-5 w-5" />
                Data Entry Tips
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('troubleshooting')}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                <AlertTriangle className="h-5 w-5" />
                Troubleshooting
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Section */}
        <Card id="getting-started" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Welcome to the Enhanced MEDEVAC System</h3>
              <p className="text-slate-600 mb-4">
                This comprehensive system manages Medical Evacuation cases for government personnel worldwide. It features an interactive analytics dashboard, real-time world mapping, automated calculations, and streamlined case management workflows.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Step 1: Explore the Dashboard
                </h4>
                <ul className="space-y-2 text-sm text-slate-600 ml-6">
                  <li>• Click "Dashboard" to view comprehensive analytics</li>
                  <li>• Review regional funding breakdowns and trends</li>
                  <li>• Interact with the world map to see active MEDEVAC routes</li>
                  <li>• Filter data by region, agency, or time period for insights</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  Step 2: Create MEDEVAC Cases
                </h4>
                <ul className="space-y-2 text-sm text-slate-600 ml-6">
                  <li>• Click "Entry Form" to create new MEDEVAC cases</li>
                  <li>• Progress through sections with automated calculations</li>
                  <li>• Use per diem integration for accurate cost estimation</li>
                  <li>• Save progress and submit completed forms</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Enhanced Features</h4>
                  <p className="text-sm text-blue-700">
                    New capabilities include real-time analytics, interactive world mapping with geographic accuracy, automated business logic calculations, comprehensive case tracking, and enhanced reporting for improved MEDEVAC operations management.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Important Note</h4>
                  <p className="text-sm text-blue-700">
                    This system follows DoD regulations for MEDEVAC case management. Ensure all information is accurate and complete before submission.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Guide */}
        <Card id="dashboard-guide" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-matisse" />
              Analytics Dashboard Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Comprehensive MEDEVAC Analytics</h3>
              <p className="text-slate-600 mb-4">
                The dashboard provides real-time insights into MEDEVAC operations worldwide, featuring interactive charts, financial summaries, and geographic visualizations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Key Metrics Overview
                </h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h5 className="font-medium text-sm mb-1">Financial Summaries</h5>
                    <p className="text-xs text-gray-600">Total funding by region, average costs per traveler, and budget utilization across all diplomatic posts</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h5 className="font-medium text-sm mb-1">Case Analytics</h5>
                    <p className="text-xs text-gray-600">Distribution of case types (MEDICAL, DENTEVAC), status tracking, and completion rates</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h5 className="font-medium text-sm mb-1">Regional Insights</h5>
                    <p className="text-xs text-gray-600">Activity breakdown by geographic regions (EUR, AF, EAP, NEA, SCA, WHA) and individual posts</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4 text-green-600" />
                  Interactive Features
                </h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h5 className="font-medium text-sm mb-1">Dynamic Filtering</h5>
                    <p className="text-xs text-gray-600">Filter data by region, timeframe, agency type, or case status for targeted analysis</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h5 className="font-medium text-sm mb-1">Export Capabilities</h5>
                    <p className="text-xs text-gray-600">Download reports, charts, and data in multiple formats for external analysis and reporting</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h5 className="font-medium text-sm mb-1">Real-time Updates</h5>
                    <p className="text-xs text-gray-600">Live data refresh, automatic calculations, and instant metric updates as new cases are processed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Dashboard Access</h4>
                  <p className="text-sm text-blue-700">
                    Click "Dashboard" in the main navigation or use the dashboard link on the landing page to access comprehensive analytics and the interactive world map.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* World Map Guide */}
        <Card id="world-map-guide" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-matisse" />
              Interactive World Map Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Global MEDEVAC Visualization</h3>
              <p className="text-slate-600 mb-4">
                The interactive world map displays real MEDEVAC routes, diplomatic posts, and medical evacuation patterns across all global regions with detailed case information.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Map Elements & Legend
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-red-50 rounded">
                    <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                    <span className="text-sm">🏥 <strong>Origin Posts</strong> - Where patients are evacuated from</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    <span className="text-sm">✈️ <strong>Medical Destinations</strong> - Treatment facilities and hospitals</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                    <div className="w-4 h-1 bg-blue-500 opacity-70"></div>
                    <span className="text-sm">--- <strong>Flight Paths</strong> - MEDEVAC routes with cost indicators</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Plane className="h-4 w-4 text-blue-600" />
                  Interactive Features
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• <strong>Click markers</strong> for detailed case information including costs, patient details, and status</li>
                  <li>• <strong>Zoom and pan</strong> to explore different regions and focus on specific geographic areas</li>
                  <li>• <strong>Marker sizing</strong> represents cost level - larger markers indicate higher-cost evacuations</li>
                  <li>• <strong>Line thickness</strong> shows total route cost - thicker lines represent more expensive routes</li>
                  <li>• <strong>Color coding</strong> differentiates between case types, agencies, and status levels</li>
                  <li>• <strong>Popup information</strong> provides comprehensive case details on click</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Geographic Coverage</h4>
                  <p className="text-sm text-green-700">
                    The world map displays MEDEVAC operations across all diplomatic regions: Europe (EUR), Africa (AF), East Asia Pacific (EAP), Near East Asia (NEA), South Central Asia (SCA), and Western Hemisphere (WHA). Real coordinates ensure accurate geographic representation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Sections Guide */}
        <Card id="form-sections" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-matisse" />
              Form Sections Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Section 1
                </Badge>
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Patient Details
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Patient name and rank</li>
                    <li>• Medical condition</li>
                    <li>• Emergency contact info</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Agency Classification
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• MSG/DOS/Seabee selection</li>
                    <li>• Department assignment</li>
                    <li>• Authorization codes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Fields
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Departure location</li>
                    <li>• Destination details</li>
                    <li>• Regional classification</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Initial Funding */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Section 2
                </Badge>
                <h3 className="text-lg font-semibold">Initial Funding</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Per Diem Calculator
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Multiple rate support</li>
                    <li>• Automatic calculations</li>
                    <li>• Airfare and misc expenses</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cable Tracking
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Cable in/out dates</li>
                    <li>• Response time tracking</li>
                    <li>• BD employee assignment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Summary
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Total cost breakdown</li>
                    <li>• Funding source tracking</li>
                    <li>• Budget validation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Future Sections</h4>
                  <p className="text-sm text-yellow-700">
                    Amendment (A1), Extensions (E1-E10), and Completion sections are available for complex cases requiring modifications or extensions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Entry Tips */}
        <Card id="data-entry" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Data Entry Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Required Fields First</h4>
                      <p className="text-sm text-slate-600">Complete all required fields (marked with *) before moving to optional fields.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Use Dropdown Menus</h4>
                      <p className="text-sm text-slate-600">Utilize dropdown selections for standardized data entry and validation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Verify Calculations</h4>
                      <p className="text-sm text-slate-600">Check automated calculations for accuracy before proceeding.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Format Guidelines</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-50 rounded p-3">
                    <h4 className="font-medium mb-1">Dates</h4>
                    <p className="text-slate-600">Use MM/DD/YYYY format (e.g., 12/25/2024)</p>
                  </div>
                  <div className="bg-slate-50 rounded p-3">
                    <h4 className="font-medium mb-1">Phone Numbers</h4>
                    <p className="text-slate-600">Include country code: +1-555-123-4567</p>
                  </div>
                  <div className="bg-slate-50 rounded p-3">
                    <h4 className="font-medium mb-1">Monetary Values</h4>
                    <p className="text-slate-600">Enter numbers only, system adds $ symbol</p>
                  </div>
                  <div className="bg-slate-50 rounded p-3">
                    <h4 className="font-medium mb-1">Names and Ranks</h4>
                    <p className="text-slate-600">Use full names: "Smith, John A." with proper rank abbreviations</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card id="troubleshooting" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-red-700 mb-2">Form Validation Errors</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Problem:</strong> Cannot proceed to next section</p>
                  <p><strong>Solution:</strong> Check for required fields marked with red asterisks (*). Hover over error messages for specific guidance.</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-red-700 mb-2">Calculation Issues</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Problem:</strong> Per diem totals not updating</p>
                  <p><strong>Solution:</strong> Ensure all date fields are complete and in correct MM/DD/YYYY format. Check that rates are entered as numbers only.</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-red-700 mb-2">Data Not Saving</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Problem:</strong> Information disappears when switching sections</p>
                  <p><strong>Solution:</strong> Complete each field fully before tabbing to next field. Use "Save Draft" feature if available.</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Need Additional Help?</h4>
                  <p className="text-sm text-red-700 mb-2">
                    Contact the MEDEVAC help desk for technical support:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone: 1-800-MEDEVAC (1-800-633-3822)
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email: medevac.support@defense.gov
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 text-slate-500 text-sm">
          <p>MEDEVAC Case Management System v2.0 | Department of Defense</p>
          <p className="mt-1">For official use only - Handle in accordance with applicable security protocols</p>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-matisse hover:bg-black-pearl text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-matisse focus:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default Instructions;