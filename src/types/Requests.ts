import type { NovelAIModel } from './Model';
import type { NovelAISampler, UCPreset, NoiseSchedule } from './Sampler';

/**
 * V4 condition input structure for prompts
 * Used by both v4_prompt and v4_negative_prompt
 */
export interface V4ConditionInput {
  caption: {
    base_caption: string;
    char_captions: string[];
  };
  use_coords: boolean;
  use_order: boolean;
  legacy_uc?: boolean;
}

/**
 * Parameters block for the generate-image API
 * Note: Mixed casing is intentional - matches strict API schema
 */
export interface NovelAIParameters {
  width: number;
  height: number;
  scale: number;
  sampler: NovelAISampler | string;
  steps: number;
  n_samples: number;
  seed: number;
  negative_prompt: string;

  // V4-specific structured prompts
  v4_prompt: V4ConditionInput;
  v4_negative_prompt: V4ConditionInput;

  // Quality and preset controls (camelCase - API requirement)
  qualityToggle: boolean;
  ucPreset: UCPreset | number;

  // Technical flags (snake_case - API requirement)
  params_version: number;
  noise_schedule: NoiseSchedule | string;
  sm: boolean;
  sm_dyn: boolean;
  dynamic_thresholding: boolean;
  prefer_brownian: boolean;
  deliberate_euler_ancestral_bug: boolean;
  legacy: boolean;
  legacy_v3_extend: boolean;
}

/**
 * Root payload structure for /ai/generate-image endpoint
 */
export interface GenerateImagePayload {
  input: string;
  model: NovelAIModel | string;
  action: 'generate';
  parameters: NovelAIParameters;
}

/**
 * SDK configuration options
 */
export interface ClientConfig {
  /** NovelAI Persistent API Token (pst-...) */
  token: string;
  /** Base URL for the image API (default: https://image.novelai.net) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
}

/**
 * Options for building an image generation request
 */
export interface ImageGenerationOptions {
  model?: NovelAIModel;
  width?: number;
  height?: number;
  prompt?: string;
  characterPrompts?: string[];
  negativePrompt?: string;
  seed?: number;
  steps?: number;
  scale?: number;
  sampler?: NovelAISampler;
  ucPreset?: UCPreset;
  qualityToggle?: boolean;
  smea?: boolean;
  smeaDyn?: boolean;
  noiseSchedule?: NoiseSchedule;
}
