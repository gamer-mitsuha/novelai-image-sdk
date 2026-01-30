/**
 * Validation error for invalid SDK parameters
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that image dimensions are multiples of 64
 * @throws ValidationError if dimensions are invalid
 */
export function validateResolution(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new ValidationError('Width and height must be integers');
  }
  if (width <= 0 || height <= 0) {
    throw new ValidationError('Width and height must be positive');
  }
  if (width % 64 !== 0) {
    throw new ValidationError(`Width must be a multiple of 64, got ${width}`);
  }
  if (height % 64 !== 0) {
    throw new ValidationError(`Height must be a multiple of 64, got ${height}`);
  }
}

/**
 * Validates that step count is within acceptable range
 * @throws ValidationError if steps are out of range
 */
export function validateSteps(steps: number): void {
  if (!Number.isInteger(steps)) {
    throw new ValidationError('Steps must be an integer');
  }
  if (steps < 1 || steps > 50) {
    throw new ValidationError(`Steps must be between 1 and 50, got ${steps}`);
  }
}

/**
 * Validates that scale (CFG) is within acceptable range
 * @throws ValidationError if scale is out of range
 */
export function validateScale(scale: number): void {
  if (typeof scale !== 'number' || isNaN(scale)) {
    throw new ValidationError('Scale must be a number');
  }
  if (scale < 0 || scale > 10) {
    throw new ValidationError(`Scale must be between 0 and 10, got ${scale}`);
  }
}

/**
 * Validates that seed is a valid unsigned 32-bit integer
 */
export function validateSeed(seed: number): void {
  if (!Number.isInteger(seed)) {
    throw new ValidationError('Seed must be an integer');
  }
  if (seed < 0 || seed > 4294967295) {
    throw new ValidationError(`Seed must be between 0 and 2^32-1, got ${seed}`);
  }
}

/**
 * Warning result for prompt length check
 */
export interface PromptWarning {
  isWarning: boolean;
  message?: string;
  length: number;
  limit: number;
}

/**
 * Check if prompt length exceeds recommended limit
 * T5 encoder has different tokenization than CLIP, so this is a heuristic
 * @param prompt - The full prompt string
 * @param limit - Character limit (default: 2000)
 * @returns Warning object with details
 */
export function checkPromptLength(prompt: string, limit = 2000): PromptWarning {
  const length = prompt.length;
  const isWarning = length > limit;
  
  return {
    isWarning,
    message: isWarning 
      ? `Prompt length (${length} chars) exceeds recommended limit of ${limit}. This may cause truncation or unexpected results.`
      : undefined,
    length,
    limit,
  };
}
