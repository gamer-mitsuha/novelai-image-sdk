import type { GenerateImagePayload, ImageResponse, APIErrorResponse } from '../types';
import {
  NovelAIError,
  NovelAIAuthError,
  NovelAIPaymentError,
  NovelAIValidationError,
  NovelAINetworkError,
  NovelAIRateLimitError,
  NovelAIServerError,
} from '../errors';
import { extractImagesFromZip } from '../utils/ZipParser';

const DEFAULT_BASE_URL = 'https://image.novelai.net';
const DEFAULT_TIMEOUT = 60000;
const GENERATE_ENDPOINT = '/ai/generate-image';

export interface APIClientConfig {
  token: string;
  baseUrl?: string;
  timeout?: number;
}

/**
 * Low-level HTTP client for NovelAI API
 * Handles authentication, binary response parsing, and error mapping
 */
export class APIClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: APIClientConfig) {
    this.token = config.token;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Generate an image using the NovelAI API
   */
  async generateImage(payload: GenerateImagePayload): Promise<ImageResponse> {
    const url = `${this.baseUrl}${GENERATE_ENDPOINT}`;

    // Generate correlation ID for debugging
    const correlationId = this.generateCorrelationId();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/x-zip-compressed, application/json',
          'x-correlation-id': correlationId,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response, correlationId);
      }

      // Parse the ZIP response
      const arrayBuffer = await response.arrayBuffer();
      const images = await extractImagesFromZip(arrayBuffer);

      return {
        images,
        metadata: {
          seed: payload.parameters.seed,
          prompt: payload.input,
          model: payload.model,
          sampler: payload.parameters.sampler as string,
          steps: payload.parameters.steps,
          scale: payload.parameters.scale,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof NovelAIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NovelAINetworkError(`Request timed out after ${this.timeout}ms`, error);
        }
        throw new NovelAINetworkError(`Network error: ${error.message}`, error);
      }

      throw new NovelAINetworkError('An unknown error occurred');
    }
  }

  /**
   * Handle non-2xx responses and throw appropriate errors
   */
  private async handleErrorResponse(response: Response, correlationId: string): Promise<never> {
    let errorBody: APIErrorResponse | null = null;

    try {
      errorBody = await response.json() as APIErrorResponse;
    } catch {
      // Response may not be JSON
    }

    const message = errorBody?.message ?? errorBody?.error ?? response.statusText;

    switch (response.status) {
      case 400:
        throw new NovelAIValidationError(
          `Bad request: ${message}`,
          JSON.stringify(errorBody)
        );
      case 401:
      case 403:
        throw new NovelAIAuthError(message);
      case 402:
        throw new NovelAIPaymentError(message);
      case 429: {
        const retryAfter = response.headers.get('retry-after');
        throw new NovelAIRateLimitError(message, retryAfter ? parseInt(retryAfter) : undefined);
      }
      case 500:
      case 502:
      case 503:
      case 504:
        throw new NovelAIServerError(
          `Server error (${response.status}): ${message}. This may be caused by payload schema issues.`,
          correlationId
        );
      default:
        throw new NovelAIError(
          `HTTP ${response.status}: ${message}`,
          response.status
        );
    }
  }

  /**
   * Generate a 6-character alphanumeric correlation ID for debugging
   */
  private generateCorrelationId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
