import type { ClientConfig, GenerateImagePayload, ImageResponse } from '../types';
import { APIClient } from '../network/APIClient';
import { ImageRequestBuilder } from '../builder/ImageRequestBuilder';

/**
 * Main entry point for the NovelAI Image SDK
 * 
 * @example
 * ```typescript
 * const client = new NovelAIClient({ token: process.env.NAI_TOKEN });
 * 
 * const result = await client.image()
 *   .setPrompt('1girl, cyberpunk, neon lights')
 *   .setSize(832, 1216)
 *   .generate();
 * 
 * fs.writeFileSync('output.png', result.images[0]);
 * ```
 */
export class NovelAIClient {
  private readonly apiClient: APIClient;

  /**
   * Create a new NovelAI client
   * @param config - Client configuration including token and optional base URL
   */
  constructor(config: ClientConfig) {
    if (!config.token) {
      throw new Error('NovelAI API token is required');
    }

    this.apiClient = new APIClient({
      token: config.token,
      baseUrl: config.baseUrl,
      timeout: config.timeout,
    });
  }

  /**
   * Start building an image generation request
   * @returns A new ImageRequestBuilder instance
   */
  image(): ImageRequestBuilder {
    return new ImageRequestBuilder(this);
  }

  /**
   * Execute a generation request (called internally by the builder)
   * @internal
   */
  async _execute(payload: GenerateImagePayload): Promise<ImageResponse> {
    return this.apiClient.generateImage(payload);
  }
}
