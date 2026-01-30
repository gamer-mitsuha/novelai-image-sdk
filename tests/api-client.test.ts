import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIClient } from '../src/network/APIClient';
import {
  NovelAIAuthError,
  NovelAIPaymentError,
  NovelAIValidationError,
  NovelAIServerError,
  NovelAIRateLimitError,
} from '../src/errors';
import type { GenerateImagePayload } from '../src/types';
import { NovelAIModel, NovelAISampler, UCPreset, NoiseSchedule } from '../src/types';

// Mock the ZipParser module
vi.mock('../src/utils/ZipParser', () => ({
  extractImagesFromZip: vi.fn().mockResolvedValue([new Uint8Array([137, 80, 78, 71])]),
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMockPayload(): GenerateImagePayload {
  return {
    input: 'test prompt',
    model: NovelAIModel.V45_Full,
    action: 'generate',
    parameters: {
      width: 832,
      height: 1216,
      scale: 5.0,
      sampler: NovelAISampler.EulerAncestral,
      steps: 23,
      n_samples: 1,
      seed: 12345,
      negative_prompt: '',
      v4_prompt: {
        caption: { base_caption: 'test', char_captions: [] },
        use_coords: false,
        use_order: true,
        legacy_uc: false,
      },
      v4_negative_prompt: {
        caption: { base_caption: '', char_captions: [] },
        use_coords: false,
        use_order: true,
        legacy_uc: false,
      },
      qualityToggle: true,
      ucPreset: UCPreset.Heavy,
      params_version: 3,
      noise_schedule: NoiseSchedule.Karras,
      sm: false,
      sm_dyn: false,
      prefer_brownian: true,
      deliberate_euler_ancestral_bug: true,
      legacy: false,
      legacy_v3_extend: false,
    },
  };
}

describe('APIClient', () => {
  let client: APIClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new APIClient({ token: 'test-token' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful requests', () => {
    it('should send correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });

      await client.generateImage(createMockPayload());

      expect(mockFetch).toHaveBeenCalledWith(
        'https://image.novelai.net/ai/generate-image',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include correlation ID header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });

      await client.generateImage(createMockPayload());

      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['x-correlation-id']).toMatch(/^[A-Za-z0-9]{6}$/);
    });

    it('should return parsed images', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });

      const result = await client.generateImage(createMockPayload());

      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toBeInstanceOf(Uint8Array);
    });
  });

  describe('error handling', () => {
    it('should throw NovelAIAuthError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid token' }),
      });

      await expect(client.generateImage(createMockPayload())).rejects.toThrow(NovelAIAuthError);
    });

    it('should throw NovelAIPaymentError on 402', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 402,
        statusText: 'Payment Required',
        json: () => Promise.resolve({ message: 'Insufficient Anlas' }),
      });

      await expect(client.generateImage(createMockPayload())).rejects.toThrow(NovelAIPaymentError);
    });

    it('should throw NovelAIValidationError on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'Invalid parameters' }),
      });

      await expect(client.generateImage(createMockPayload())).rejects.toThrow(NovelAIValidationError);
    });

    it('should throw NovelAIServerError on 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'Server error' }),
      });

      await expect(client.generateImage(createMockPayload())).rejects.toThrow(NovelAIServerError);
    });

    it('should throw NovelAIRateLimitError on 429', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Map([['retry-after', '60']]),
        json: () => Promise.resolve({ message: 'Rate limited' }),
      });

      await expect(client.generateImage(createMockPayload())).rejects.toThrow(NovelAIRateLimitError);
    });
  });

  describe('custom configuration', () => {
    it('should use custom base URL', async () => {
      const customClient = new APIClient({
        token: 'test-token',
        baseUrl: 'https://custom.example.com',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });

      await customClient.generateImage(createMockPayload());

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.example.com/ai/generate-image',
        expect.any(Object)
      );
    });
  });
});
