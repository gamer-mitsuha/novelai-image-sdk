/**
 * Supported NovelAI image generation models
 */
export enum NovelAIModel {
  /** V4.5 Full - Latest model with T5 encoding and multi-character support */
  V45_Full = "nai-diffusion-4-5-full",
  /** V4 Curated - More conservative aesthetic choices */
  V4_Curated = "nai-diffusion-4-curated",
  /** V4 Inpainting - For image editing and inpainting tasks */
  Inpainting = "nai-diffusion-4-inpainting",
}
