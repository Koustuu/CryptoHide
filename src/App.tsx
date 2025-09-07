import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import QRDebugPanel from './components/debug/QRDebugPanel';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import EncodePage from './pages/EncodePage';
import DecodePage from './pages/DecodePage';
import AboutPage from './pages/AboutPage';

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
        </Routes>
        <QRDebugPanel />
      </Router>
    </AuthProvider>
  );
}

export default App;