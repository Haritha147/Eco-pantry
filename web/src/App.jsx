import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './layouts/AppLayout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import RecipesPage from './pages/RecipesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import AlertSettingsPage from './pages/AlertSettingsPage';
import AiConfigSettingsPage from './pages/AiConfigSettingsPage';
import GenericSubPage from './pages/GenericSubPage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/audit" element={<GenericSubPage />} />
            <Route path="/inventory" element={<GenericSubPage />} />
            <Route path="/inventory/:id" element={<GenericSubPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/scanner/receipt" element={<GenericSubPage />} />
            <Route path="/scanner/fridge" element={<GenericSubPage />} />
            <Route path="/scanner/ar" element={<GenericSubPage />} />
            <Route path="/scanner/voice" element={<GenericSubPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/saved" element={<GenericSubPage />} />
            <Route path="/recipes/history" element={<GenericSubPage />} />
            <Route path="/recipes/:id" element={<GenericSubPage />} />
            <Route path="/shopping-list" element={<GenericSubPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/analytics/co2" element={<GenericSubPage />} />
            <Route path="/analytics/waste" element={<GenericSubPage />} />
            <Route path="/donations/ngos" element={<GenericSubPage />} />
            <Route path="/donations/history" element={<GenericSubPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/chat" element={<GenericSubPage />} />
            <Route path="/community/scans" element={<GenericSubPage />} />
            <Route path="/community/badges" element={<GenericSubPage />} />
            <Route path="/settings/profile" element={<ProfilePage />} />
            {/* Support legacy /profile URL used in some bookmarks/screenshots */}
            <Route path="/profile" element={<Navigate to="/settings/profile" replace />} />
            <Route path="/settings/security" element={<SecuritySettingsPage />} />
            <Route path="/settings/alerts" element={<AlertSettingsPage />} />
            <Route path="/settings/ai" element={<AiConfigSettingsPage />} />
            <Route path="/help" element={<GenericSubPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
