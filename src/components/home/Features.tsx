import React from 'react';
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Eye size={32} className="text-purple-400" />,
      title: 'Hide Messages',
      description: 'Conceal text, files, or other data within ordinary images that appear unchanged to the naked eye.'
    },
    {
      icon: <EyeOff size={32} className="text-indigo-400" />,
      title: 'Extract Hidden Data',
      description: 'Easily retrieve concealed information from steganographic images with our decoding tools.'
    },
    {
      icon: <ShieldCheck size={32} className="text-blue-400" />,
      title: 'Advanced Encryption',
      description: 'Add an extra layer of security with optional password protection and encryption.'
    },
    {
      icon: <Lock size={32} className="text-yellow-400" />,
      title: 'Privacy Focused',
      description: 'Your data never leaves your browser. All encoding and decoding happens locally on your device.'
    }
  ];

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powerful Steganography Features
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our advanced tools help you conceal and protect your sensitive information
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-800 border border-indigo-900 rounded-lg p-6 shadow-lg transition duration-300 hover:transform hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-950 rounded-full mb-6 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 text-center">{feature.title}</h3>
              <p className="text-gray-400 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;