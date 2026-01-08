import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import EncodePage from './pages/EncodePage';
import DecodePage from './pages/DecodePage';
import AboutPage from './pages/AboutPage';
import TermsAndPrivacyPage from './pages/TermsAndPrivacyPage';
import HomePage from './pages/HomePage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/encode" element={<EncodePage />} />
        <Route path="/decode" element={<DecodePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/terms-privacy" element={<TermsAndPrivacyPage />} />
      </Routes>
    </Router>
  );
}

export default App;