/**
 * Utility functions for file hash management in the one-time view system
 */

// In-memory storage for file hashes (in production, this would be a database)
const viewedHashes = new Set<string>();

/**
 * Computes a SHA-256 hash of the file
 * @param file - The file to hash
 * @returns Promise<string> - The hex string of the hash
 */
export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if a file hash has already been viewed
 * @param hash - The hash to check
 * @returns Promise<boolean> - True if the hash exists (file has been viewed)
 */
export async function checkFileHash(hash: string): Promise<boolean> {
  return viewedHashes.has(hash);
}

/**
 * Stores a file hash to mark it as viewed
 * @param hash - The hash to store
 * @returns Promise<void>
 */
export async function storeFileHash(hash: string): Promise<void> {
  viewedHashes.add(hash);
}
