import React from 'react';
import Layout from '../components/layout/Layout';
import DecodeForm from '../components/steganography/DecodeForm';
import { EyeOff } from 'lucide-react';

const DecodePage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-indigo-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-900 rounded-full mb-4">
              <EyeOff size={32} className="text-yellow-300" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Reveal Hidden Messages
            </h1>
            <p className="mt-2 text-lg text-gray-300">
              Extract concealed information from steganographic images
            </p>
          </div>
          
          <DecodeForm />
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">How Steganography Works</h2>
              <p className="text-gray-300">
                Steganography works by modifying parts of the media data that are less noticeable to the human eye. 
                This allows information to be hidden within the image while maintaining its visual appearance. 
                Different algorithms use various techniques to achieve this, from simple least significant bit 
                manipulation to more complex transformations.
              </p>
            </div>
            
            <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Privacy & Security</h2>
              <p className="text-gray-300">
                All processing happens directly in your browser. No images or messages are sent to our servers. 
                For maximum security, consider adding password protection to your hidden messages, which adds 
                encryption on top of the steganographic technique, making your messages doubly secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DecodePage;