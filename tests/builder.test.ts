import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageRequestBuilder } from '../src/builder/ImageRequestBuilder';
import { NovelAIModel, NovelAISampler, UCPreset, NoiseSchedule } from '../src/types';
import type { NovelAIClient } from '../src/client/NovelAIClient';

// Mock client that captures the payload
function createMockClient() {
  return {
    _execute: vi.fn().mockResolvedValue({
      images: [new Uint8Array([1, 2, 3])],
      metadata: {},
    }),
  } as unknown as NovelAIClient;
}

describe('ImageRequestBuilder', () => {
  let mockClient: NovelAIClient;
  let builder: ImageRequestBuilder;

  beforeEach(() => {
    mockClient = createMockClient();
    builder = new ImageRequestBuilder(mockClient);
  });

  describe('default values', () => {
    it('should have sensible defaults', () => {
      const payload = builder.buildPayload();

      expect(payload.model).toBe(NovelAIModel.V45_Full);
      expect(payload.action).toBe('generate');
      expect(payload.parameters.width).toBe(832);
      expect(payload.parameters.height).toBe(1216);
      expect(payload.parameters.sampler).toBe(NovelAISampler.EulerAncestral);
      expect(payload.parameters.steps).toBe(23);
      expect(payload.parameters.scale).toBe(5.0);
      expect(payload.parameters.qualityToggle).toBe(true);
      expect(payload.parameters.params_version).toBe(3);
      expect(payload.parameters.noise_schedule).toBe(NoiseSchedule.Karras);
      expect(payload.parameters.sm).toBe(false);
      expect(payload.parameters.sm_dyn).toBe(false);
    });
  });

  describe('method chaining', () => {
    it('should support fluent API', () => {
      const result = builder
        .setModel(NovelAIModel.V45_Full)
        .setSize(1024, 1024)
        .setPrompt('test prompt')
        .setSampler(NovelAISampler.DPM_2M)
        .setSteps(28)
        .setScale(7.0)
        .enableSMEA(true);

      expect(result).toBe(builder);
    });
  });

  describe('setSize', () => {
    it('should set valid dimensions', () => {
      builder.setSize(1024, 768);
      const payload = builder.buildPayload();

      expect(payload.parameters.width).toBe(1024);
      expect(payload.parameters.height).toBe(768);
    });

    it('should throw on invalid dimensions', () => {
      expect(() => builder.setSize(1000, 1000)).toThrow('multiple of 64');
    });
  });

  describe('setPrompt', () => {
    it('should set base prompt', () => {
      builder.setPrompt('cyberpunk city');
      const payload = builder.buildPayload();

      expect(payload.input).toBe('cyberpunk city');
      expect(payload.parameters.v4_prompt.caption.base_caption).toBe('cyberpunk city');
    });

    it('should handle multi-character prompts', () => {
      builder.setPrompt('cafeteria scene', ['girl, blue hair', 'boy, red hoodie']);
      const payload = builder.buildPayload();

      expect(payload.input).toBe('cafeteria scene | girl, blue hair | boy, red hoodie');
      expect(payload.parameters.v4_prompt.caption.base_caption).toBe('cafeteria scene');
      expect(payload.parameters.v4_prompt.caption.char_captions).toEqual([
        'girl, blue hair',
        'boy, red hoodie',
      ]);
    });
  });

  describe('addCharacter', () => {
    it('should add characters incrementally', () => {
      builder
        .setPrompt('park scene')
        .addCharacter('girl, white dress')
        .addCharacter('boy, casual clothes');

      const payload = builder.buildPayload();

      expect(payload.parameters.v4_prompt.caption.char_captions).toHaveLength(2);
      expect(payload.input).toContain('girl, white dress');
      expect(payload.input).toContain('boy, casual clothes');
    });
  });

  describe('enableSMEA', () => {
    it('should enable SMEA without dynamic', () => {
      builder.enableSMEA(false);
      const payload = builder.buildPayload();

      expect(payload.parameters.sm).toBe(true);
      expect(payload.parameters.sm_dyn).toBe(false);
    });

    it('should enable dynamic SMEA', () => {
      builder.enableSMEA(true);
      const payload = builder.buildPayload();

      expect(payload.parameters.sm).toBe(true);
      expect(payload.parameters.sm_dyn).toBe(true);
    });
  });

  describe('enableDynamicThresholding', () => {
    it('should enable dynamic thresholding', () => {
      builder.enableDynamicThresholding();
      const payload = builder.buildPayload();

      expect(payload.parameters.dynamic_thresholding).toBe(true);
    });

    it('should be disabled by default', () => {
      const payload = builder.buildPayload();
      expect(payload.parameters.dynamic_thresholding).toBe(false);
    });
  });

  describe('V4 structure compliance', () => {
    it('should produce correct V4 prompt structure', () => {
      builder.setPrompt('test', ['char1']);
      const payload = builder.buildPayload();

      expect(payload.parameters.v4_prompt).toEqual({
        caption: {
          base_caption: 'test',
          char_captions: ['char1'],
        },
        use_coords: false,
        use_order: true,
        legacy_uc: false,
      });
    });

    it('should include all required technical flags', () => {
      const payload = builder.buildPayload();

      // Verify all required flags are present
      expect(payload.parameters.prefer_brownian).toBe(true);
      expect(payload.parameters.deliberate_euler_ancestral_bug).toBe(true);
      expect(payload.parameters.legacy).toBe(false);
      expect(payload.parameters.legacy_v3_extend).toBe(false);
    });
  });

  describe('generate', () => {
    it('should call client._execute with built payload', async () => {
      await builder.setPrompt('test').generate();

      expect(mockClient._execute).toHaveBeenCalledTimes(1);
      const calledPayload = (mockClient._execute as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledPayload.input).toBe('test');
    });
  });
});
