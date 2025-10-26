import React from 'react';
import Layout from '../components/layout/Layout';
import { ShieldCheck, Lock, Eye, Code } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-indigo-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              About CryptoHide Steganography
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our mission is to provide secure, accessible steganography tools for everyone who values privacy
            </p>
          </div>
          
          <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-xl p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">What is Steganography?</h2>
            
            <p className="text-gray-300 mb-4">
              Steganography is the practice of concealing information within ordinary, non-secret data or a physical object to avoid detection. The word comes from the Greek words "steganos" (meaning covered or concealed) and "graphein" (writing).
            </p>
            
            <p className="text-gray-300 mb-4">
              Unlike cryptography, which focuses on making data unreadable, steganography focuses on keeping the existence of the data itself secret. It's like hiding a secret message in plain sight.
            </p>
            
            <div className="my-8 bg-indigo-900/30 p-6 rounded-lg border border-indigo-800">
              <h3 className="text-xl font-semibold text-white mb-4">Historical Context</h3>
              <p className="text-gray-300">
                Steganography has been used throughout history:
              </p>
              <ul className="mt-3 space-y-2 text-gray-300">
                <li className="flex">
                  <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                  <span>Ancient Greece: Messages were tattooed on slaves' shaved heads, then hidden by hair growth</span>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                  <span>World War II: Invisible inks were used to hide messages between visible text on paper</span>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                  <span>Modern digital era: Information is hidden within digital files like images, audio, or video</span>
                </li>
              </ul>
            </div>
            
            <p className="text-gray-300">
              Today, digital steganography is used for various legitimate purposes, including digital watermarking for copyright protection, secure communication channels for sensitive information, and enhanced privacy for personal data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-900 p-3 rounded-full mr-4">
                  <ShieldCheck size={24} className="text-yellow-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Our Technology</h2>
              </div>
              
              <p className="text-gray-300 mb-4">
                CryptoHide uses advanced steganography algorithms including:
              </p>
              
              <ul className="space-y-2 text-gray-300">
                <li className="flex">
                  <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                  <span><strong>LSB (Least Significant Bit):</strong> Embeds data in the least significant bits of pixel values</span>
                </li>
                
              </ul>
              
              <p className="text-gray-300 mt-4">
                All processing happens client-side in your browser, ensuring your data never leaves your device.
              </p>
            </div>
            
            <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-900 p-3 rounded-full mr-4">
                  <Lock size={24} className="text-yellow-300" />
                </div>
                <h2 className="text-xl font-bold text-white">Privacy Commitment</h2>
              </div>
              
              <p className="text-gray-300 mb-4">
                At CryptoHide, we believe privacy is a fundamental right. Our commitment to your privacy includes:
              </p>
              
              <ul className="space-y-2 text-gray-300">
                <li className="flex">
                  <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                  <span>No storage of your media or messages on our servers</span>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                  <span>All processing happens locally in your browser</span>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                  <span>Optional encryption for additional security</span>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 text-purple-400 mr-2">•</div>
                  <span>Open-source code for transparency and trust</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-indigo-900 rounded-lg shadow-xl p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-900 p-3 rounded-full mr-4">
                <Code size={24} className="text-yellow-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">How to Use Our Tools</h2>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Eye size={20} className="mr-2 text-purple-400" />
                  Encoding Messages
                </h3>
                <ol className="space-y-2 text-gray-300 list-decimal list-inside ml-4">
                  <li>Upload an media to serve as your carrier file</li>
                  <li>Enter the secret message you want to hide</li>
                  <li>Optionally add a password for extra security</li>                  
                  <li>Download the resulting media with your hidden message</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Eye size={20} className="mr-2 text-purple-400" />
                  Decoding Messages
                </h3>
                <ol className="space-y-2 text-gray-300 list-decimal list-inside ml-4">
                  <li>Upload a media that contains a hidden message</li>
                  <li>Enter the password if one was used during encoding</li>
                  <li>Click "Reveal Hidden Message" to extract the concealed information</li>
                  <li>View the extracted message</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;