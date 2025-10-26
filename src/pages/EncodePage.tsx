import React from 'react';
import Layout from '../components/layout/Layout';
import EncodeForm from '../components/steganography/EncodeForm';
import { Eye } from 'lucide-react';

const EncodePage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-indigo-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-900 rounded-full mb-4">
              <Eye size={32} className="text-yellow-300" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Hide Your Message
            </h1>
            <p className="mt-2 text-lg text-gray-300">
              Securely embed your secret text within an ordinary-looking image
            </p>
          </div>
          
          <EncodeForm />
          
          <div className="mt-12 bg-gray-800 border border-indigo-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Tips for Effective Steganography</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex">
                <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                <span>Use high-resolution media as they can store more information.</span>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                <span>Photos with lots of details or textures work better than simple, flat-colored images.</span>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                <span>Always use a password for sensitive information to add an extra layer of security.</span>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                <span>Avoid compressing the resulting media as it can damage the hidden data.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EncodePage;