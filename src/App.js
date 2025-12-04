import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import './styles/themes.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import EntryForm from './pages/EntryForm';
import DatabaseView from './pages/DatabaseView';
import PostData from './pages/PostData';
import ScraperForm from './pages/ScraperForm';
import Instructions from './components/Instructions';
import LandingPage from './pages/LandingPage';
import DocumentationPage from './pages/DocumentationPage';
import MedevacDashboard from './pages/MedevacDashboard';
import MedevacManagement from './pages/MedevacManagement';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-theme-bg-primary text-theme-text-primary transition-colors duration-200">
      <Navigation />
      
      <main className={isLandingPage ? "" : "max-w-7xl mx-auto px-6 py-8"}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/form" element={<EntryForm />} />
          <Route path="/management" element={<MedevacManagement />} />
          <Route path="/database" element={<DatabaseView />} />
          <Route path="/post-data" element={<PostData />} />
          <Route path="/scraper" element={<ScraperForm />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/dashboard" element={<MedevacDashboard />} />
        </Routes>
      </main>

        <footer className="bg-theme-bg-secondary border-t border-theme-border-primary mt-12">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-gold-accent mb-3">Emergency Contacts</h3>
                <div className="space-y-2 text-sm">
                  <p>Medical Unit: +1 (202) 647-3175</p>
                  <p>After Hours: +1 (202) 647-4000</p>
                  <p>Email: MedicalEmergencies@state.gov</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gold-accent mb-3">Important Notice</h3>
                <p className="text-sm">
                  This system is for official U.S. Department of State use only. 
                  All medical information is classified and protected under HIPAA regulations.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gold-accent mb-3">System Information</h3>
                <div className="space-y-2 text-sm">
                  <p>Version: 2.1.0 (Prototype)</p>
                  <p>Last Updated: January 2025</p>
                  <p>Security Level: SENSITIVE</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-600 mt-8 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center text-xs opacity-75">
                <p>© 2025 U.S. Department of State - Medical Evacuation Services</p>
                <p>Prototype Version - Not for Official Distribution</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
