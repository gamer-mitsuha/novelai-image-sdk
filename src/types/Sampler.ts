/**
 * Supported sampling algorithms for image generation
 */
export enum NovelAISampler {
  /** Standard Euler sampler */
  Euler = "k_euler",
  /** Euler Ancestral - recommended for anime-style generations */
  EulerAncestral = "k_euler_ancestral",
  /** DPM++ 2M - stable and aesthetic */
  DPM_2M = "k_dpmpp_2m",
  /** DPM++ 2S Ancestral */
  DPM_2S_Ancestral = "k_dpmpp_2s_ancestral",
  /** DPM++ SDE */
  DPM_SDE = "k_dpmpp_sde",
  /** DDIM V3 */
  DDIM = "ddim_v3",
}

/**
 * Preset negative prompt configurations
 */
export enum UCPreset {
  /** Heavy - Low Quality + Bad Anatomy */
  Heavy = 0,
  /** Light - Low Quality only */
  Light = 1,
  /** None - Use custom negative prompt only */
  None = 2,
}

/**
 * Noise schedule algorithms
 */
export enum NoiseSchedule {
  Native = "native",
  Karras = "karras",
  Exponential = "exponential",
  Polyexponential = "polyexponential",
}
