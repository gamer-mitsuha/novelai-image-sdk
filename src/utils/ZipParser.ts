/**
 * Isomorphic ZIP parser that works in both Node.js and browser environments
 * Extracts PNG files from NovelAI's application/x-zip-compressed response
 */

/**
 * Detects if we're running in a Node.js environment
 */
function isNodeEnvironment(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

/**
 * Extract PNG files from a ZIP archive buffer
 * @param data - The raw ZIP archive data
 * @returns Array of extracted PNG file contents
 */
export async function extractImagesFromZip(
  data: ArrayBuffer | Uint8Array
): Promise<Uint8Array[]> {
  const buffer = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

  if (isNodeEnvironment()) {
    return extractWithAdmZip(buffer);
  } else {
    return extractWithFflate(buffer);
  }
}

/**
 * Node.js extraction using adm-zip
 */
async function extractWithAdmZip(buffer: Uint8Array): Promise<Uint8Array[]> {
  // Dynamic import for Node.js environment
  const AdmZip = (await import('adm-zip')).default;
  const zip = new AdmZip(Buffer.from(buffer));
  const entries = zip.getEntries();
  const images: Uint8Array[] = [];

  for (const entry of entries) {
    if (entry.entryName.endsWith('.png') && !entry.isDirectory) {
      const data = entry.getData();
      images.push(new Uint8Array(data));
    }
  }

  return images;
}

/**
 * Browser extraction using fflate
 */
async function extractWithFflate(buffer: Uint8Array): Promise<Uint8Array[]> {
  // Dynamic import for browser environment
  const { unzipSync } = await import('fflate');
  const unzipped = unzipSync(buffer);
  const images: Uint8Array[] = [];

  for (const [filename, data] of Object.entries(unzipped)) {
    if (filename.endsWith('.png')) {
      images.push(data);
    }
  }

  return images;
}

/**
 * Convert Uint8Array to Base64 string (useful for browser display)
 */
export function toBase64(data: Uint8Array): string {
  if (isNodeEnvironment()) {
    return Buffer.from(data).toString('base64');
  } else {
    // Browser environment
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
  }
}

/**
 * Convert Uint8Array to data URL for direct use in img src
 */
export function toDataURL(data: Uint8Array, mimeType = 'image/png'): string {
  return `data:${mimeType};base64,${toBase64(data)}`;
}
