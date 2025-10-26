# 🕵️‍♂️ CryptoHide  
### *A Secure Steganography System for Hidden Data Communication*

---

## 🔒 Overview  
**CryptoHide** is a team project that integrates **cryptography** and **steganography** to enable secret and secure message transmission. It allows users to **encrypt** and **hide messages** inside carrier files such as images, audio, video, or QR codes — ensuring privacy, stealth, and data protection.

---

## ⚙️ Features  
- 🔐 **AES Encryption (with PBKDF2)** – Provides strong, password-based encryption.  
- 🧩 **Multi-Format Steganography** – Supports Image, Audio, Video, and QR-based data hiding.  
- 💻 **Web-Based Interface** – Simple and intuitive frontend for encoding & decoding.  
- ⚡ **Fast & Lightweight** – Efficient logic with minimal dependencies.  
- 🛠 **Extensible Design** – Easy to extend with new algorithms or media types.

---

## 🧠 How It Works  

CryptoHide integrates multiple steganography techniques, each tailored to a specific media type. The process dynamically adapts based on the selected medium:

1. **User Input:**  
   The user selects the media type — *Image, Audio, Video, or QR* — and enters the secret message along with an encryption key.

2. **Encryption (PBKDF2 + AES-CBC):**  
   - The key is processed through **PBKDF2** to generate a strong cryptographic key.  
   - The message is then encrypted using **AES in CBC mode**, ensuring high confidentiality.  

3. **Steganography Encoding:**  
   - 🖼 **Image Steganography (LSB Method):**  
     The encrypted message is embedded within the pixel values using **Least Significant Bit substitution**, keeping visual quality unchanged.  
   - 🎵 **Audio Steganography:**  
     The encrypted data is encoded in the **least significant bits of audio samples**, maintaining the same sound quality to human ears.  
   - 🎬 **Video Steganography:**  
     The system splits the video into frames and hides the encrypted message inside selected frames using pixel-level LSB manipulation.  
   - 🔲 **QR Code Steganography:**  
     A normal QR code redirects to a dummy link, while the custom CryptoHide decoder extracts the hidden encrypted text embedded inside the QR pattern.

4. **Decoding & Decryption:**  
   - During extraction, the hidden data is retrieved using the corresponding decoding algorithm.  
   - The ciphertext is then **decrypted using AES-CBC** with the same key, revealing the original secret message.

---

> 🔐 **In short:**  
> Each media type uses a unique embedding method, but all share a common encryption layer — making CryptoHide a multi-format, dual-security steganography system.

---

## 🛠️ Setup & Usage  
```bash
git clone https://github.com/Koustuu/CryptoHide.git
cd CryptoHide
npm install
npm run dev
