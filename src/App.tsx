import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';


// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import EncodePage from './pages/EncodePage';
import DecodePage from './pages/DecodePage';
import AboutPage from './pages/AboutPage';
import TermsAndPrivacyPage from './pages/TermsAndPrivacyPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/encode" element={
            <ProtectedRoute>
              <EncodePage />
            </ProtectedRoute>
          } />
          <Route path="/decode" element={
            <ProtectedRoute>
              <DecodePage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms-privacy" element={<TermsAndPrivacyPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;