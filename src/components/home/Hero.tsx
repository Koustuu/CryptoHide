import React from 'react';
import { Lock, Shield, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Hero: React.FC = () => {
  const { isAuthenticated, setIntendedRoute } = useAuth();
  const navigate = useNavigate();

  const handleSteganographyClick = (route: string) => {
    if (isAuthenticated) {
      navigate(route);
    } else {
      setIntendedRoute(route);
      navigate(route); // This will trigger the ProtectedRoute and show auth modal
    }
  };
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-gray-900 opacity-90"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-900 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-indigo-800 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Secure Your Messages with <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-300">CryptoHide</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              Hide your confidential information within ordinary media.
              Our advanced steganography tool keeps your secrets safe from prying eyes.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleSteganographyClick('/encode')}
                className="px-8 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-medium transition duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <Eye size={20} className="mr-2" />
                Hide Message
              </button>

              <button
                onClick={() => handleSteganographyClick('/decode')}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition duration-300 border border-purple-500 flex items-center justify-center"
              >
                <Shield size={20} className="mr-2" />
                Decode Media
              </button>
            </div>
          </div>
          
          <div className="md:w-2/5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg opacity-20 blur-md transform rotate-3"></div>
              <div className="relative bg-gray-800 p-8 rounded-lg shadow-2xl border border-indigo-800">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-indigo-900 p-3 rounded-full">
                    <Lock size={28} className="text-yellow-300" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white text-center mb-4">
                  Encrypt with Confidence
                </h3>
                
                <ul className="space-y-3 mb-6">
                  {[
                    'Military-grade encryption',
                    'No data stored on our servers',
                    'Multiple steganography algorithms',
                    'Works with images, audio, video and QR code, '
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center justify-center mt-6">
                  <Link
                    to="/about"
                    className="text-purple-400 hover:text-purple-300 transition duration-300 text-sm"
                  >
                    Learn more about our technology →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;