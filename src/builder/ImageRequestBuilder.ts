import type { NovelAIClient } from '../client/NovelAIClient';
import type {
  GenerateImagePayload,
  NovelAIParameters,
  V4ConditionInput,
  ImageResponse,
} from '../types';
import { NovelAIModel, NovelAISampler, UCPreset, NoiseSchedule } from '../types';
import { validateResolution, validateSteps, validateScale, validateSeed } from '../utils/Validators';

/**
 * Fluent builder for constructing NovelAI image generation requests
 * Provides method chaining and compile-time type safety
 */
export class ImageRequestBuilder {
  private client: NovelAIClient;

  // Core parameters with sensible defaults
  private model: NovelAIModel = NovelAIModel.V45_Full;
  private width = 832;
  private height = 1216;
  private prompt = '';
  private characterPrompts: string[] = [];
  private negativePrompt = '';
  private characterNegativePrompts: string[] = [];
  private seed: number = Math.floor(Math.random() * 4294967295);
  private steps = 23;
  private scale = 5.0;
  private nSamples = 1;
  private sampler: NovelAISampler = NovelAISampler.EulerAncestral;
  private ucPreset: UCPreset = UCPreset.Heavy;
  private qualityToggle = true;
  private smea = false;
  private smeaDyn = false;
  private dynamicThresholding = false;
  private noiseSchedule: NoiseSchedule = NoiseSchedule.Karras;

  constructor(client: NovelAIClient) {
    this.client = client;
  }

  /**
   * Set the model to use for generation
   */
  setModel(model: NovelAIModel): this {
    this.model = model;
    return this;
  }

  /**
   * Set the output image dimensions
   * @throws ValidationError if dimensions are not multiples of 64
   */
  setSize(width: number, height: number): this {
    validateResolution(width, height);
    this.width = width;
    this.height = height;
    return this;
  }

  /**
   * Set the main prompt (base scene description)
   * For multi-character prompts, use the array overload
   */
  setPrompt(base: string, characters?: string[]): this {
    this.prompt = base;
    if (characters) {
      this.characterPrompts = characters;
    }
    return this;
  }

  /**
   * Add character prompts for multi-character scenes
   */
  addCharacter(characterPrompt: string): this {
    this.characterPrompts.push(characterPrompt);
    return this;
  }

  /**
   * Set the negative prompt (what to avoid in generation)
   * Optionally provide per-character negative prompts
   */
  setNegativePrompt(base: string, characterNegatives?: string[]): this {
    this.negativePrompt = base;
    if (characterNegatives) {
      this.characterNegativePrompts = characterNegatives;
    }
    return this;
  }

  /**
   * Add a per-character negative prompt
   * Should correspond to character prompts added via addCharacter()
   */
  addCharacterNegative(negativePrompt: string): this {
    this.characterNegativePrompts.push(negativePrompt);
    return this;
  }

  /**
   * Set the random seed for reproducible generations
   */
  setSeed(seed: number): this {
    validateSeed(seed);
    this.seed = seed;
    return this;
  }

  /**
   * Set the number of sampling steps
   * @throws ValidationError if steps are out of range (1-50)
   */
  setSteps(steps: number): this {
    validateSteps(steps);
    this.steps = steps;
    return this;
  }

  /**
   * Set the CFG (Classifier-Free Guidance) scale
   * Higher values follow the prompt more strictly
   * @throws ValidationError if scale is out of range (0-10)
   */
  setCfgScale(scale: number): this {
    validateScale(scale);
    this.scale = scale;
    return this;
  }

  /**
   * Set the number of images to generate in a single request
   * Note: Each additional sample consumes Anlas credits
   * @param count - Number of images (1-4 typically supported)
   */
  setBatchSize(count: number): this {
    if (!Number.isInteger(count) || count < 1) {
      throw new Error('Batch size must be a positive integer');
    }
    this.nSamples = count;
    return this;
  }

  /**
   * Set the sampling algorithm
   */
  setSampler(sampler: NovelAISampler): this {
    this.sampler = sampler;
    return this;
  }

  /**
   * Set the negative prompt preset (predefined undesired content filters)
   * Heavy = Low Quality + Bad Anatomy, Light = Low Quality only, None = Custom only
   */
  setNegativePreset(preset: UCPreset): this {
    this.ucPreset = preset;
    return this;
  }

  /**
   * Enable automatic quality tags ("best quality, amazing quality")
   */
  enableAutoQualityTags(enabled = true): this {
    this.qualityToggle = enabled;
    return this;
  }

  /**
   * Enable SMEA (Sinusoidal Multipass Euler Ancestral)
   * @param dynamic - If true, enables dynamic SMEA variant
   */
  enableSMEA(dynamic = false): this {
    this.smea = true;
    this.smeaDyn = dynamic;
    return this;
  }

  /**
   * Disable SMEA
   */
  disableSMEA(): this {
    this.smea = false;
    this.smeaDyn = false;
    return this;
  }

  /**
   * Set the noise schedule algorithm
   */
  setNoiseSchedule(schedule: NoiseSchedule): this {
    this.noiseSchedule = schedule;
    return this;
  }

  /**
   * Enable dynamic thresholding
   * Enhances contrast at high CFG scales (scale > 7)
   */
  enableDynamicThresholding(): this {
    this.dynamicThresholding = true;
    return this;
  }

  /**
   * Disable dynamic thresholding
   */
  disableDynamicThresholding(): this {
    this.dynamicThresholding = false;
    return this;
  }

  /**
   * Build the V4 condition input structure for prompts
   */
  private buildV4ConditionInput(base: string, characters: string[]): V4ConditionInput {
    return {
      caption: {
        base_caption: base,
        char_captions: characters,
      },
      use_coords: false,
      use_order: true,
      legacy_uc: false,
    };
  }

  /**
   * Build the formatted input string for the API
   * Combines base prompt with character prompts using pipe delimiter
   */
  private buildInputString(): string {
    if (this.characterPrompts.length === 0) {
      return this.prompt;
    }
    return [this.prompt, ...this.characterPrompts].join(' | ');
  }

  /**
   * Build the complete API payload
   */
  buildPayload(): GenerateImagePayload {
    const parameters: NovelAIParameters = {
      width: this.width,
      height: this.height,
      scale: this.scale,
      sampler: this.sampler,
      steps: this.steps,
      n_samples: this.nSamples,
      seed: this.seed,
      negative_prompt: this.negativePrompt,

      // V4-specific structured prompts
      v4_prompt: this.buildV4ConditionInput(this.prompt, this.characterPrompts),
      v4_negative_prompt: this.buildV4ConditionInput(this.negativePrompt, this.characterNegativePrompts),

      // Quality and preset controls (camelCase - API requirement)
      qualityToggle: this.qualityToggle,
      ucPreset: this.ucPreset,

      // Technical flags (snake_case - API requirement)
      params_version: 3,
      noise_schedule: this.noiseSchedule,
      sm: this.smea,
      sm_dyn: this.smeaDyn,
      dynamic_thresholding: this.dynamicThresholding,
      prefer_brownian: true,
      deliberate_euler_ancestral_bug: true,
      legacy: false,
      legacy_v3_extend: false,
    };

    return {
      input: this.buildInputString(),
      model: this.model,
      action: 'generate',
      parameters,
    };
  }

  /**
   * Execute the image generation request
   */
  async generate(): Promise<ImageResponse> {
    const payload = this.buildPayload();
    return this.client._execute(payload);
  }
}
