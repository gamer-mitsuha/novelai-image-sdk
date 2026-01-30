// Main client
export { NovelAIClient } from './client/NovelAIClient';

// Builder
export { ImageRequestBuilder } from './builder/ImageRequestBuilder';

// Types and enums
export {
  NovelAIModel,
  NovelAISampler,
  UCPreset,
  NoiseSchedule,
} from './types';

export type {
  ClientConfig,
  ImageGenerationOptions,
  ImageResponse,
  ImageMetadata,
  GenerateImagePayload,
  NovelAIParameters,
  V4ConditionInput,
} from './types';

// Errors
export {
  NovelAIError,
  NovelAIAuthError,
  NovelAIPaymentError,
  NovelAIValidationError,
  NovelAINetworkError,
  NovelAIRateLimitError,
  NovelAIServerError,
} from './errors';

// Utilities
export { toBase64, toDataURL } from './utils/ZipParser';
export {
  validateResolution,
  validateSteps,
  validateScale,
  validateSeed,
  checkPromptLength,
} from './utils/Validators';
export type { PromptWarning } from './utils/Validators';
