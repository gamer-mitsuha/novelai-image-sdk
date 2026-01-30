import { describe, it, expect } from 'vitest';
import { NovelAIClient } from '../src/client/NovelAIClient';
import { ImageRequestBuilder } from '../src/builder/ImageRequestBuilder';

describe('NovelAIClient', () => {
  describe('constructor', () => {
    it('should require a token', () => {
      expect(() => new NovelAIClient({ token: '' })).toThrow('token is required');
    });

    it('should accept valid configuration', () => {
      const client = new NovelAIClient({ token: 'pst-test-token' });
      expect(client).toBeInstanceOf(NovelAIClient);
    });

    it('should accept custom base URL', () => {
      const client = new NovelAIClient({
        token: 'pst-test-token',
        baseUrl: 'https://custom.example.com',
      });
      expect(client).toBeInstanceOf(NovelAIClient);
    });
  });

  describe('image()', () => {
    it('should return an ImageRequestBuilder', () => {
      const client = new NovelAIClient({ token: 'pst-test-token' });
      const builder = client.image();

      expect(builder).toBeInstanceOf(ImageRequestBuilder);
    });

    it('should return a new builder each time', () => {
      const client = new NovelAIClient({ token: 'pst-test-token' });
      const builder1 = client.image();
      const builder2 = client.image();

      expect(builder1).not.toBe(builder2);
    });
  });
});
