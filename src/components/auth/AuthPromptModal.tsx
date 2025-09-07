import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, Shield } from 'lucide-react';
import Layout from '../layout/Layout';

interface AuthPromptModalProps {
  isOpen: boolean;
  message: string;
  intendedRoute?: string;
}

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  message
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToSignup = () => {
    navigate('/create-account');
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-indigo-950">
        <div className="w-full max-w-lg">
          <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-900 rounded-full mb-6">
                <Lock size={40} className="text-yellow-300" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
              <p className="text-lg text-gray-300 mb-2">{message}</p>
              <p className="text-sm text-gray-400">
                Sign in to your account or create a new one to continue
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoToLogin}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-white bg-purple-700 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 text-lg font-medium"
              >
                <LogIn size={20} className="mr-3" />
                Sign In to Continue
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">or</span>
                </div>
              </div>

              <button
                onClick={handleGoToSignup}
                className="w-full flex justify-center items-center py-4 px-6 border border-gray-600 rounded-lg shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 text-lg font-medium"
              >
                <UserPlus size={20} className="mr-3" />
                Create New Account
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="text-center">
                <button
                  onClick={handleGoHome}
                  className="text-gray-400 hover:text-white transition duration-200 text-sm"
                >
                  ← Return to Homepage
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-800">
              <div className="flex items-start">
                <Shield size={16} className="text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-indigo-300 font-medium mb-1">Why do I need to sign in?</p>
                  <p className="text-xs text-indigo-200">
                    Authentication ensures secure access to steganography features and protects your privacy. 
                    Your data remains encrypted and private to your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPromptModal;
