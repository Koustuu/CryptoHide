import { encryptMessage, decryptMessage } from './videoCryptoUtils.js';
import { MESSAGE_DELIMITER } from './constants.js';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Convert string or Uint8Array to binary string
export function stringToBinary(data: Uint8Array | string): string {
  if (typeof data === 'string') {
    return Array.from(data).map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
  } else {
    return Array.from(data).map(byte => byte.toString(2).padStart(8, '0')).join('');
  }
}

// Convert binary string to Uint8Array
export function binaryToBytes(binaryString: string): Uint8Array {
  const bytes = [];
  for (let i = 0; i < binaryString.length; i += 8) {
    const byte = binaryString.slice(i, i + 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }
  return new Uint8Array(bytes);
}

// Encode message into video using LSB steganography
export async function encodeVideo(videoFile: File, message: string, password: string): Promise<Blob | null> {
  try {
    // Encrypt message
    const { encryptedMessage, salt } = await encryptMessage(message, password);

    // Combine salt length, salt, encrypted message, and delimiter into binary string
    const saltLengthBinary = salt.length.toString(2).padStart(16, '0');
    const binaryDataToHide = saltLengthBinary + stringToBinary(salt) + stringToBinary(encryptedMessage) + stringToBinary(MESSAGE_DELIMITER);

    // Create video element to process the file
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    return new Promise((resolve) => {
      video.onloadeddata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Seek to first frame
        video.currentTime = 0;
      };

      video.onseeked = async () => {
        // Draw first frame to canvas
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Embed binary data in LSB of image data
        const data = imageData.data;
        let binaryIndex = 0;

        for (let i = 0; i < data.length && binaryIndex < binaryDataToHide.length; i += 4) {
          for (let j = 0; j < 3; j++) { // RGB channels only
            if (binaryIndex < binaryDataToHide.length) {
              // Clear LSB and set it to binary data bit
              data[i + j] = (data[i + j] & 0xFE) | parseInt(binaryDataToHide[binaryIndex]);
              binaryIndex++;
            }
          }
        }

        // Put modified image data back
        ctx.putImageData(imageData, 0, 0);

        // Convert to PNG blob
        canvas.toBlob(async (pngBlob) => {
          if (!pngBlob) {
            resolve(null);
            return;
          }

          // Use ffmpeg.wasm to create AVI video from the PNG frame
          const ffmpeg = new FFmpeg();
          ffmpeg.on('log', ({ message }) => {
            console.log(message);
          });

          // Load ffmpeg
          await ffmpeg.load({
            coreURL: await toBlobURL('/node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js', 'text/javascript'),
            wasmURL: await toBlobURL('/node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
          });

          // Write input PNG to ffmpeg
          await ffmpeg.writeFile('input.png', await fetchFile(pngBlob));

          // Run ffmpeg command to create AVI video
          await ffmpeg.exec([
            '-i', 'input.png',
            '-c:v', 'libx264',
            '-t', '5', // 5 seconds duration
            '-pix_fmt', 'yuv420p',
            '-f', 'avi',
            'output.avi'
          ]);

          // Read output AVI
          const outputData = await ffmpeg.readFile('output.avi');
          const aviBlob = new Blob([outputData as any], { type: 'video/avi' });

          resolve(aviBlob);
        }, 'image/png');
      };

      // Load video file
      const url = URL.createObjectURL(videoFile);
      video.src = url;
      video.load();
    });
  } catch (error) {
    console.error('Video encoding failed:', error);
    return null;
  }
}

// Decode message from video using LSB steganography
export async function decodeVideo(videoFile: File, password: string): Promise<string | null> {
  try {
    // Create video element to process the file
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    return new Promise((resolve) => {
      video.onloadeddata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Seek to first frame
        video.currentTime = 0;
      };

      video.onseeked = async () => {
        // Draw first frame to canvas
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Extract binary data from LSB of image data
        const data = imageData.data;
        let binaryString = '';

        for (let i = 0; i < data.length; i += 4) {
          for (let j = 0; j < 3; j++) { // RGB channels only
            binaryString += (data[i + j] & 1).toString();
          }
        }

        // Parse the salt and encrypted message
        // The first 16 bits are the salt length
        if (binaryString.length < 16) {
          console.error("Error: Binary data is too short to contain salt length.");
          resolve("Error: Could not extract salt length from video data.");
          return;
        }

        const saltLengthBinary = binaryString.slice(0, 16);
        const saltLength = parseInt(saltLengthBinary, 2);

        // The next 'saltLength' bits are the salt
        const saltBinary = binaryString.slice(16, 16 + saltLength * 8); // Salt length is in bytes, convert to bits
        if (saltBinary.length !== saltLength * 8) {
          console.error("Error: Binary data is too short to contain the full salt.");
          resolve("Error: Could not extract salt from video data.");
          return;
        }
        const salt = binaryToBytes(saltBinary);

        // The remaining bits are the encrypted message
        const encryptedMessageBinary = binaryString.slice(16 + saltLength * 8);
        const encryptedMessage = binaryToBytes(encryptedMessageBinary);

        // Attempt to decrypt the message using the extracted salt and provided password
        const decryptedMessage = await decryptMessage(encryptedMessage, password, salt);

        if (decryptedMessage !== null) {
          console.log("Decoding and decryption complete. Message found.");
          resolve(decryptedMessage);
        } else {
          // decryptMessage already prints an error message for invalid password
          resolve("Decryption failed. Please check the password or the video file.");
        }
      };

      // Load video file
      const url = URL.createObjectURL(videoFile);
      video.src = url;
      video.load();
    });
  } catch (error) {
    console.error('Video decoding failed:', error);
    return null;
  }
}
