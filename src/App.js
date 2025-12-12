import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import './styles/themes.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import LoginPage from './pages/SimpleLoginPage';
import RequestAccountPage from './pages/RequestAccountPage';
import EntryForm from './pages/EntryForm';
import DatabaseView from './pages/DatabaseView';
import PostData from './pages/PostData';
import ScraperForm from './pages/ScraperForm';
import Instructions from './components/Instructions';
import LandingPage from './pages/LandingPage';
import DocumentationPage from './pages/DocumentationPage';
import MedevacDashboard from './pages/MedevacDashboard';
import MedevacManagement from './pages/MedevacManagement';
import AccessRequestForm from './components/AccessRequestForm';
import AccessRequestAdmin from './components/AccessRequestAdmin';
import AIShowcase from './pages/AIShowcase';
import Presentation from './pages/Presentation';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isPublicLandingPage = location.pathname === '/' && !isAuthenticated;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MEDEVAC System...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and tries to access login page, redirect to showcase
  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/showcase" />;
  }

  // If user is authenticated and goes to root, redirect to showcase
  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to="/showcase" />;
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary text-theme-text-primary transition-colors duration-200">
      {!isLoginPage && <Navigation />}
      
      <main className={isPublicLandingPage || isLoginPage ? "" : "max-w-7xl mx-auto px-6 py-8"}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/request-account" element={<RequestAccountPage />} />
          <Route path="/request-access" element={<AccessRequestForm />} />
          {!isAuthenticated && <Route path="/" element={<LandingPage />} />}
          
          {/* Protected routes */}
          <Route path="/showcase" element={
            <ProtectedRoute>
              <AIShowcase />
            </ProtectedRoute>
          } />
          <Route path="/presentation" element={
            <ProtectedRoute>
              <Presentation />
            </ProtectedRoute>
          } />
          <Route path="/form" element={
            <ProtectedRoute>
              <EntryForm />
            </ProtectedRoute>
          } />
          <Route path="/form/:id" element={
            <ProtectedRoute>
              <EntryForm />
            </ProtectedRoute>
          } />
          <Route path="/management" element={
            <ProtectedRoute>
              <MedevacManagement />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <MedevacDashboard />
            </ProtectedRoute>
          } />
          <Route path="/database" element={
            <ProtectedRoute>
              <DatabaseView />
            </ProtectedRoute>
          } />
          <Route path="/post-data" element={
            <ProtectedRoute>
              <PostData />
            </ProtectedRoute>
          } />
          <Route path="/scraper" element={
            <ProtectedRoute>
              <ScraperForm />
            </ProtectedRoute>
          } />
          <Route path="/instructions" element={
            <ProtectedRoute>
              <Instructions />
            </ProtectedRoute>
          } />
          <Route path="/documentation" element={
            <ProtectedRoute>
              <DocumentationPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/requests" element={
            <ProtectedRoute>
              <AccessRequestAdmin />
            </ProtectedRoute>
          } />
          
          {/* Redirect authenticated users from root to management */}
          {isAuthenticated && <Route path="/" element={<Navigate to="/management" />} />}
        </Routes>
      </main>

        <footer className="bg-theme-bg-secondary border-t border-theme-border-primary mt-12">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-gold-accent mb-3">Emergency Contacts</h3>
                <div className="space-y-2 text-sm">
                  <p>Medical Unit: 123-456-7890</p>
                  <p>After Hours: 123-456-7891</p>
                  <p>Email: example@email.gov</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gold-accent mb-3">Important Notice</h3>
                <p className="text-sm">
                  This is a prototype system for demonstration purposes only.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gold-accent mb-3">System Information</h3>
                <div className="space-y-2 text-sm">
                  <p>Version: 2.1.0 (Prototype)</p>
                  <p>Last Updated: December 2025</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-600 mt-8 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center text-xs opacity-75">
                <p>Medical Evacuation Services</p>
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
