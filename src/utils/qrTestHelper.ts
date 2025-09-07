/**
 * QR Code Steganography Test Helper
 * Utility functions to help test and debug QR code functionality
 */

import { createEncryptedQR, extractEncryptedQR } from './qrSteganography';

export interface QRTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Test the complete QR code encode/decode workflow
 */
export async function testQRWorkflow(
  websiteUrl: string = 'https://example.com',
  hiddenMessage: string = 'This is a test hidden message',
  password: string = 'testPassword123'
): Promise<QRTestResult> {
  try {
    console.log('=== QR Code Workflow Test ===');
    console.log('Website URL:', websiteUrl);
    console.log('Hidden Message:', hiddenMessage);
    console.log('Password:', password);

    // Step 1: Create encrypted QR code
    console.log('\n1. Creating encrypted QR code...');
    const createResult = await createEncryptedQR({
      websiteUrl,
      hiddenMessage,
      password,
      errorCorrectionLevel: 'H'
    });

    if (!createResult.success || !createResult.data) {
      return {
        success: false,
        message: 'Failed to create QR code',
        details: createResult
      };
    }

    console.log('✅ QR code created successfully');

    // Step 2: Convert data URL to File object for testing
    console.log('\n2. Converting QR code to File object...');
    const file = await dataURLToFile(createResult.data, 'test-qr.png');
    console.log('✅ File object created:', file.name, file.size, 'bytes');

    // Step 3: Extract and decrypt
    console.log('\n3. Extracting and decrypting QR code...');
    const extractResult = await extractEncryptedQR(file, password);

    if (!extractResult.success) {
      return {
        success: false,
        message: 'Failed to extract QR code',
        details: extractResult
      };
    }

    // Step 4: Verify results
    console.log('\n4. Verifying results...');
    const websiteMatch = extractResult.websiteUrl === websiteUrl;
    const messageMatch = extractResult.hiddenMessage === hiddenMessage;

    console.log('Website URL match:', websiteMatch, extractResult.websiteUrl);
    console.log('Hidden message match:', messageMatch, extractResult.hiddenMessage);

    if (websiteMatch && messageMatch) {
      return {
        success: true,
        message: 'QR code workflow test passed successfully!',
        details: {
          original: { websiteUrl, hiddenMessage },
          extracted: { 
            websiteUrl: extractResult.websiteUrl, 
            hiddenMessage: extractResult.hiddenMessage 
          }
        }
      };
    } else {
      return {
        success: false,
        message: 'QR code workflow test failed - data mismatch',
        details: {
          original: { websiteUrl, hiddenMessage },
          extracted: { 
            websiteUrl: extractResult.websiteUrl, 
            hiddenMessage: extractResult.hiddenMessage 
          },
          matches: { websiteMatch, messageMatch }
        }
      };
    }

  } catch (error) {
    console.error('QR workflow test error:', error);
    return {
      success: false,
      message: 'QR code workflow test failed with error',
      details: error
    };
  }
}

/**
 * Convert data URL to File object for testing
 */
async function dataURLToFile(dataURL: string, filename: string): Promise<File> {
  const response = await fetch(dataURL);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

/**
 * Test QR code creation only
 */
export async function testQRCreation(
  websiteUrl: string = 'https://github.com',
  hiddenMessage: string = 'Secret message for testing',
  password: string = 'test123'
): Promise<QRTestResult> {
  try {
    const result = await createEncryptedQR({
      websiteUrl,
      hiddenMessage,
      password
    });

    if (result.success && result.data) {
      return {
        success: true,
        message: 'QR code creation test passed',
        details: {
          dataUrlLength: result.data.length,
          websiteUrl: result.websiteUrl,
          hiddenMessage: result.hiddenMessage
        }
      };
    } else {
      return {
        success: false,
        message: 'QR code creation test failed',
        details: result
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'QR code creation test failed with error',
      details: error
    };
  }
}

/**
 * Run all QR code tests
 */
export async function runAllQRTests(): Promise<void> {
  console.log('🧪 Running QR Code Steganography Tests...\n');

  // Test 1: Basic workflow
  const test1 = await testQRWorkflow();
  console.log('Test 1 (Basic Workflow):', test1.success ? '✅ PASS' : '❌ FAIL');
  if (!test1.success) console.log('Details:', test1.details);

  // Test 2: Different parameters
  const test2 = await testQRWorkflow(
    'https://cryptohide.app',
    'Another secret message with special chars: !@#$%^&*()',
    'complexPassword!123'
  );
  console.log('Test 2 (Complex Data):', test2.success ? '✅ PASS' : '❌ FAIL');
  if (!test2.success) console.log('Details:', test2.details);

  // Test 3: Creation only
  const test3 = await testQRCreation();
  console.log('Test 3 (Creation Only):', test3.success ? '✅ PASS' : '❌ FAIL');
  if (!test3.success) console.log('Details:', test3.details);

  console.log('\n🏁 QR Code Tests Complete');
}

// Make test functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).qrTests = {
    testQRWorkflow,
    testQRCreation,
    runAllQRTests
  };
  console.log('QR Test functions available: window.qrTests.runAllQRTests()');
}
