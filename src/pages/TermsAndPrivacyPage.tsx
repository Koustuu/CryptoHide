import React from 'react';
import Layout from '../components/layout/Layout';

const TermsAndPrivacyPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Terms and Conditions & Privacy Policy
          </h1>

          <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">A. Terms of Service (ToS)</h2>
                <ol className="list-decimal list-inside space-y-4 text-gray-300">
                  <li>
                    <strong className="text-white">Acceptance of Terms</strong><br />
                    By accessing or using the Multi-Media Steganography Tool (the "Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the Service.
                  </li>
                  <li>
                    <strong className="text-white">Nature of the Service (Hybrid Processing Model)</strong><br />
                    The Service operates under a hybrid processing model:<br />
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Authentication Data (Server-Side):</strong> User login credentials (email and a secure hash of the password) are stored on our database (MongoDB) to facilitate account access.</li>
                      <li><strong>Steganography Processing (Client-Side):</strong> All file handling, data encryption, steganographic embedding, and key derivation for the actual message hiding process occur exclusively within your local web browser. NO media files, hidden messages, or steganography passwords are uploaded to or stored on our servers.</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-white">User Responsibilities</strong><br />
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials (email and password). You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                      <li><strong>Steganography Passwords:</strong> You are solely responsible for remembering and protecting the separate passwords used to encrypt your hidden messages. The Service does not store, recover, or have any access to these steganography passwords or the hidden messages. We cannot decrypt or recover messages if the steganography password is lost or forgotten.</li>
                      <li><strong>Lawful Use:</strong> You agree not to use the Service for any unlawful or prohibited purpose. You must comply with all applicable local, state, national, and international laws regarding the use of encryption and steganography technology.</li>
                      <li><strong>File Ownership:</strong> You represent and warrant that you own or have the necessary licenses and permissions to use any file (audio, image, video, or QR code) you process using the Service.</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-white">Limitation of Liability</strong><br />
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the operation or availability of the Service or the accuracy, reliability, or completeness of any data processed.</li>
                      <li>In no event shall the providers of this Service be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including, without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                        <ol className="list-decimal list-inside ml-6 mt-2 space-y-1">
                          <li>Your access to or use of, or inability to access or use, the Service;</li>
                          <li>Loss of data or message privacy due to lost steganography passwords;</li>
                          <li>Any breach of security concerning the server-stored authentication data, except where gross negligence is proven on the part of the service providers.</li>
                        </ol>
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">B. Privacy Policy</h2>
                <ol className="list-decimal list-inside space-y-4 text-gray-300">
                  <li>
                    <strong className="text-white">Data Collected and Stored (Server-Side)</strong><br />
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Authentication Data:</strong> We collect and store the following data on our secure MongoDB server solely for the purpose of user authentication and account management:
                        <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                          <li><strong>Email Address:</strong> Used as your unique account identifier.</li>
                          <li><strong>Hashed Password:</strong> Your password is never stored in plaintext. It is stored using a strong, one-way hashing algorithm with appropriate salting.</li>
                        </ul>
                      </li>
                      <li><strong>Steganography Data (Local):</strong> We do not collect, process, or store user-uploaded media files, steganography passwords, encryption keys, or hidden messages on our servers. This data remains confined to your browser's local memory and processor.</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-white">Data Security Measures</strong><br />
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Storage Security:</strong> Authentication credentials stored in MongoDB are protected using industry-standard security practices, including the use of encryption-at-rest and strict access controls.</li>
                      <li><strong>Password Handling:</strong> Passwords are never stored in their original form. They are secured using strong hashing algorithms with a unique salt applied to each user to prevent brute-force and dictionary attacks.</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-white">Client-Side Processing and Storage</strong><br />
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><strong>Local Processing:</strong> The Service temporarily holds file data in your browser's local memory (RAM) only during the time necessary for the encoding or decoding operation. This data is cleared immediately upon successful file generation or page refresh.</li>
                      <li><strong>Cookies:</strong> We may use essential cookies necessary for the operation of the website (e.g., session management for logged-in users). We do not use tracking or advertising cookies.</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-white">Data Security Responsibility</strong><br />
                    The security of your server-stored account is managed by us. However, the security of the steganography content is entirely dependent on the security of your device and the strength of the separate steganography password you choose.
                  </li>
                  <li>
                    <strong className="text-white">Changes to This Policy</strong><br />
                    We reserve the right to update our Privacy Policy and Terms of Service from time to time. We will notify you of any changes by posting the new Policy and Terms on this page.
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-500 text-center">
                Last updated: October 26, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsAndPrivacyPage;
