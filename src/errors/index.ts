/**
 * Base error class for all NovelAI SDK errors
 */
export class NovelAIError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'NovelAIError';
    this.statusCode = statusCode;
  }
}

/**
 * Authentication error (401/403)
 * Thrown when the API token is invalid or expired
 */
export class NovelAIAuthError extends NovelAIError {
  constructor(message = 'Authentication failed. Check your Persistent API Token (pst-...).') {
    super(message, 401);
    this.name = 'NovelAIAuthError';
  }
}

/**
 * Payment required error (402)
 * Thrown when the user has insufficient Anlas credits
 */
export class NovelAIPaymentError extends NovelAIError {
  constructor(message = 'Insufficient Anlas credits for this generation.') {
    super(message, 402);
    this.name = 'NovelAIPaymentError';
  }
}

/**
 * Validation error (400)
 * Thrown when the API rejects the payload due to schema issues
 */
export class NovelAIValidationError extends NovelAIError {
  public readonly details?: string;

  constructor(message: string, details?: string) {
    super(message, 400);
    this.name = 'NovelAIValidationError';
    this.details = details;
  }
}

/**
 * Network error
 * Thrown on timeouts, connection failures, or other network issues
 */
export class NovelAINetworkError extends NovelAIError {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'NovelAINetworkError';
    this.cause = cause;
  }
}

/**
 * Rate limit error (429)
 * Thrown when too many requests are made
 */
export class NovelAIRateLimitError extends NovelAIError {
  public readonly retryAfter?: number;

  constructor(message = 'Rate limit exceeded. Please wait before retrying.', retryAfter?: number) {
    super(message, 429);
    this.name = 'NovelAIRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Server error (500+)
 * Thrown when the NovelAI server encounters an internal error
 */
export class NovelAIServerError extends NovelAIError {
  public readonly correlationId?: string;

  constructor(message = 'NovelAI server error. This may be due to payload schema issues.', correlationId?: string) {
    super(message, 500);
    this.name = 'NovelAIServerError';
    this.correlationId = correlationId;
  }
}
