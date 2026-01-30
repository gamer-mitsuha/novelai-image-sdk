/**
 * Metadata extracted from generated images
 */
export interface ImageMetadata {
  seed?: number;
  prompt?: string;
  model?: string;
  sampler?: string;
  steps?: number;
  scale?: number;
}

/**
 * Response from a successful image generation
 */
export interface ImageResponse {
  /** Generated image(s) as Buffer (Node.js) or Uint8Array (Browser) */
  images: Uint8Array[];
  /** Optional metadata parsed from response */
  metadata?: ImageMetadata;
}

/**
 * Raw API error response structure
 */
export interface APIErrorResponse {
  statusCode?: number;
  message?: string;
  error?: string;
}
