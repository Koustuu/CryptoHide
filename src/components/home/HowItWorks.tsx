import React from 'react';
import { Upload, MessageSquare, Download, Lock } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Upload size={28} className="text-purple-400" />,
      title: 'Upload an Media',
      description: 'Select any compatible media from your device to use as a carrier for your hidden message.'
    },
    {
      icon: <MessageSquare size={28} className="text-indigo-400" />,
      title: 'Enter Your Message',
      description: 'Type or paste the text you want to hide. Add optional password protection for extra security.'
    },
    {
      icon: <Lock size={28} className="text-blue-400" />,
      title: 'Process Securely',
      description: 'Our algorithm embeds your message in the image using advanced steganography techniques.'
    },
    {
      icon: <Download size={28} className="text-yellow-400" />,
      title: 'Download Result',
      description: 'Save the processed image, which looks normal but contains your hidden message.'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-indigo-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Hiding your information in media is simple and secure with our easy-to-use process
          </p>
        </div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-24 w-0.5 h-[calc(100%-80px)] bg-indigo-800 -z-10 transform -translate-x-1/2"></div>
          
          <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-indigo-900 border-2 border-purple-500 rounded-full mb-6 z-10">
                    {step.icon}
                  </div>
                  
                  <span className="absolute top-0 -left-3 lg:static px-3 py-1 bg-purple-700 text-white text-sm font-bold rounded-full mb-4">
                    Step {index + 1}
                  </span>
                  
                  <div className="bg-gray-800 border border-indigo-800 p-6 rounded-lg shadow-lg w-full">
                    <h3 className="text-xl font-semibold text-white mb-3 text-center">{step.title}</h3>
                    <p className="text-gray-400 text-center">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;