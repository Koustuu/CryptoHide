import React from 'react';
import { Shield, Key, Github as GitHub } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Footer: React.FC = () => {
  const { isAuthenticated, setIntendedRoute } = useAuth();
  const navigate = useNavigate();

  const handleSteganographyClick = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(route);
    } else {
      setIntendedRoute(route);
      navigate(route); // This will trigger the ProtectedRoute and show auth modal
    }
  };
  return (
    <footer className="bg-indigo-950 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300 flex items-center">
              <Shield size={18} className="mr-2" /> CryptoHide
            </h3>
            <p className="text-gray-400 mb-4">
              Secure steganography tool for hiding messages within media.
              Protect your private communications with state-of-the-art encryption.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-yellow-300 transition duration-300"
                aria-label="GitHub"
              >
                <GitHub size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300 flex items-center">
              <Key size={18} className="mr-2" /> Security
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms-privacy" className="text-gray-400 hover:text-yellow-300 transition duration-300">Terms and Conditions & Privacy Policy</a>
              </li>
              <li>
                <a href="/security" className="text-gray-400 hover:text-yellow-300 transition duration-300"></a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-yellow-300 transition duration-300">Home</a>
              </li>
              <li>
                <a
                  href="/encode"
                  onClick={(e) => handleSteganographyClick(e, '/encode')}
                  className="text-gray-400 hover:text-yellow-300 transition duration-300 cursor-pointer"
                >
                  Encode
                </a>
              </li>
              <li>
                <a
                  href="/decode"
                  onClick={(e) => handleSteganographyClick(e, '/decode')}
                  className="text-gray-400 hover:text-yellow-300 transition duration-300 cursor-pointer"
                >
                  Decode
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-yellow-300 transition duration-300">About</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-indigo-900 mt-8 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} CryptoHide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;