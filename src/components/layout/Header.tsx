import React, { useState } from 'react';
import { Menu, X, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-indigo-950 text-white shadow-md fixed w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mr-4 lg:hidden text-gray-100 hover:text-purple-300 transition duration-300"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link to="/" className="flex items-center group">
            <div className="bg-purple-700 p-2 rounded-lg mr-3 group-hover:bg-purple-600 transition duration-300">
              <Lock size={20} className="text-yellow-300" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-yellow-300">
              CryptoHide
            </h1>
          </Link>
          
          <nav className="hidden lg:flex ml-8">
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="text-gray-200 hover:text-yellow-300 transition duration-300">Home</Link>
              </li>
              <li>
                <Link to="/encode" className="text-gray-200 hover:text-yellow-300 transition duration-300 flex items-center">
                  <Eye size={16} className="mr-1" /> Encode
                </Link>
              </li>
              <li>
                <Link to="/decode" className="text-gray-200 hover:text-yellow-300 transition duration-300 flex items-center">
                  <EyeOff size={16} className="mr-1" /> Decode
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-200 hover:text-yellow-300 transition duration-300">About</Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div>
          {/* No authentication UI needed */}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-indigo-900 shadow-lg">
          <nav className="container mx-auto px-4 py-3">
            <ul className="space-y-4 pb-3">
              <li>
                <Link 
                  to="/" 
                  className="block text-gray-200 hover:text-yellow-300 transition duration-300 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/encode" 
                  className="block text-gray-200 hover:text-yellow-300 transition duration-300 py-2 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Eye size={16} className="mr-2" /> Encode
                </Link>
              </li>
              <li>
                <Link 
                  to="/decode" 
                  className="block text-gray-200 hover:text-yellow-300 transition duration-300 py-2 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <EyeOff size={16} className="mr-2" /> Decode
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="block text-gray-200 hover:text-yellow-300 transition duration-300 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </li>

              {/* No authentication section needed */}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;