import React, { useState } from 'react';
import { Bug, Play, CheckCircle, XCircle, Download } from 'lucide-react';
import { testQRWorkflow, testQRCreation, runAllQRTests } from '../../utils/qrTestHelper';
import { createEncryptedQR, downloadQRCode } from '../../utils/qrSteganography';

const QRDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [testQRData, setTestQRData] = useState<string | null>(null);

  const runTest = async (testType: 'workflow' | 'creation' | 'all') => {
    setIsRunning(true);
    setTestResults('Running tests...\n');

    try {
      let result;
      switch (testType) {
        case 'workflow':
          result = await testQRWorkflow();
          setTestResults(`Workflow Test: ${result.success ? '✅ PASS' : '❌ FAIL'}\n${result.message}\n${JSON.stringify(result.details, null, 2)}`);
          break;
        case 'creation':
          result = await testQRCreation();
          setTestResults(`Creation Test: ${result.success ? '✅ PASS' : '❌ FAIL'}\n${result.message}\n${JSON.stringify(result.details, null, 2)}`);
          break;
        case 'all':
          // Capture console output
          const originalLog = console.log;
          let output = '';
          console.log = (...args) => {
            output += args.join(' ') + '\n';
            originalLog(...args);
          };
          
          await runAllQRTests();
          console.log = originalLog;
          setTestResults(output);
          break;
      }
    } catch (error) {
      setTestResults(`Test failed with error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const generateTestQR = async () => {
    setIsRunning(true);
    try {
      const result = await createEncryptedQR({
        websiteUrl: 'https://github.com/cryptohide',
        hiddenMessage: 'This is a test QR code generated from the debug panel!',
        password: 'debugTest123',
        errorCorrectionLevel: 'H'
      });

      if (result.success && result.data) {
        setTestQRData(result.data);
        setTestResults('✅ Test QR code generated successfully!\nWebsite: https://github.com/cryptohide\nHidden Message: This is a test QR code generated from the debug panel!\nPassword: debugTest123');
      } else {
        setTestResults(`❌ Failed to generate test QR code: ${result.error}`);
      }
    } catch (error) {
      setTestResults(`❌ Error generating test QR code: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-full shadow-lg transition-colors"
          title="QR Debug Panel"
        >
          <Bug size={20} />
        </button>
      ) : (
        <div className="bg-gray-800 border border-orange-500 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center">
              <Bug size={16} className="mr-2 text-orange-400" />
              QR Debug Panel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => runTest('workflow')}
              disabled={isRunning}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded disabled:opacity-50"
            >
              <Play size={12} className="inline mr-1" />
              Test Workflow
            </button>
            <button
              onClick={() => runTest('creation')}
              disabled={isRunning}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded disabled:opacity-50"
            >
              <CheckCircle size={12} className="inline mr-1" />
              Test Creation
            </button>
            <button
              onClick={() => runTest('all')}
              disabled={isRunning}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded disabled:opacity-50"
            >
              <Play size={12} className="inline mr-1" />
              Run All Tests
            </button>
            <button
              onClick={generateTestQR}
              disabled={isRunning}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white text-xs rounded disabled:opacity-50"
            >
              Generate Test QR
            </button>
          </div>

          {testQRData && (
            <div className="mb-3">
              <div className="bg-white p-2 rounded mb-2 flex justify-center">
                <img src={testQRData} alt="Test QR Code" className="max-w-24 max-h-24" />
              </div>
              <button
                onClick={() => downloadQRCode(testQRData, 'debug-test-qr.png')}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded w-full"
              >
                <Download size={12} className="inline mr-1" />
                Download Test QR
              </button>
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <pre className="text-xs text-gray-300 bg-gray-900 p-2 rounded whitespace-pre-wrap">
              {testResults || 'Click a test button to run QR code tests...'}
            </pre>
          </div>

          <div className="mt-2 text-xs text-gray-400">
            💡 Open browser console for detailed logs
          </div>
        </div>
      )}
    </div>
  );
};

export default QRDebugPanel;
