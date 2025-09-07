import React from 'react';
import Layout from '../components/layout/Layout';
import LoginForm from '../components/auth/LoginForm';
import { Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-indigo-950">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-900 rounded-full mb-4">
              <Lock size={32} className="text-yellow-300" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Sign in to CryptoHide
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Access your secure steganography workspace
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;