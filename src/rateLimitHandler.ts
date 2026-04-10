/**
 * Rate Limit Error Handler
 * Detects and logs rate limit errors from various AI APIs
 */

import { getPool } from './storage';

export interface RateLimitError {
  id?: number;
  service: 'OpenAI' | 'Gemini' | 'Apify' | 'Other';
  model: string;
  error_message: string;
  reset_time: Date | null;
  retry_after_seconds: number | null;
  occurred_at: Date;
}

/**
 * Detect if an error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  if (!error) return false;

  // Check HTTP status code
  if (error.status === 429 || error.statusCode === 429 || error.code === 429) {
    return true;
  }

  // Check error message
  const errorMessage = (error.message || error.error || '').toLowerCase();
  return (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('quota exceeded') ||
    errorMessage.includes('429')
  );
}

/**
 * Extract rate limit information from error
 */
export function extractRateLimitInfo(error: any, service: string, model: string): RateLimitError {
  const now = new Date();
  let resetTime: Date | null = null;
  let retryAfter: number | null = null;

  // Try to extract reset time from headers
  if (error.headers) {
    // OpenAI uses x-ratelimit-reset (Unix timestamp)
    if (error.headers['x-ratelimit-reset']) {
      const resetTimestamp = parseInt(error.headers['x-ratelimit-reset']);
      resetTime = new Date(resetTimestamp * 1000);
    }

    // Standard retry-after header (seconds)
    if (error.headers['retry-after']) {
      retryAfter = parseInt(error.headers['retry-after']);
      if (retryAfter && !resetTime) {
        resetTime = new Date(now.getTime() + retryAfter * 1000);
      }
    }
  }

  // Try to extract from error response body
  if (error.response?.headers) {
    if (error.response.headers['x-ratelimit-reset']) {
      const resetTimestamp = parseInt(error.response.headers['x-ratelimit-reset']);
      resetTime = new Date(resetTimestamp * 1000);
    }
    if (error.response.headers['retry-after']) {
      retryAfter = parseInt(error.response.headers['retry-after']);
      if (retryAfter && !resetTime) {
        resetTime = new Date(now.getTime() + retryAfter * 1000);
      }
    }
  }

  // Default retry time if not specified (usually 60 seconds for most APIs)
  if (!retryAfter) {
    retryAfter = 60;
  }
  if (!resetTime) {
    resetTime = new Date(now.getTime() + retryAfter * 1000);
  }

  return {
    service: service as any,
    model,
    error_message: error.message || error.error || 'Rate limit exceeded',
    reset_time: resetTime,
    retry_after_seconds: retryAfter,
    occurred_at: now,
  };
}

/**
 * Log rate limit error to database
 */
export async function logRateLimitError(errorInfo: RateLimitError): Promise<void> {
  const db = getPool();

  try {
    // Create table if it doesn't exist (for first run)
    await db.query(`
      CREATE TABLE IF NOT EXISTS rate_limit_errors (
        id SERIAL PRIMARY KEY,
        service VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        error_message TEXT,
        reset_time TIMESTAMP,
        retry_after_seconds INT,
        occurred_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert error
    await db.query(
      `INSERT INTO rate_limit_errors (service, model, error_message, reset_time, retry_after_seconds, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        errorInfo.service,
        errorInfo.model,
        errorInfo.error_message,
        errorInfo.reset_time,
        errorInfo.retry_after_seconds,
        errorInfo.occurred_at,
      ]
    );

    console.log(`📝 Rate limit error logged: ${errorInfo.service} (${errorInfo.model})`);
  } catch (error) {
    console.error('❌ Failed to log rate limit error to database:', error);
  }
}

/**
 * Get recent rate limit errors (last 24 hours)
 */
export async function getRecentRateLimitErrors(): Promise<RateLimitError[]> {
  const db = getPool();

  try {
    // Check if table exists first
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'rate_limit_errors'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      return [];
    }

    const result = await db.query(`
      SELECT *
      FROM rate_limit_errors
      WHERE occurred_at > NOW() - INTERVAL '24 hours'
      ORDER BY occurred_at DESC
      LIMIT 50
    `);

    return result.rows;
  } catch (error) {
    console.error('❌ Failed to fetch rate limit errors from database:', error);
    return [];
  }
}

/**
 * Handle rate limit error (detect, log, and format for response)
 */
export async function handleRateLimitError(
  error: any,
  service: string,
  model: string
): Promise<RateLimitError | null> {
  if (!isRateLimitError(error)) {
    return null;
  }

  const errorInfo = extractRateLimitInfo(error, service, model);
  await logRateLimitError(errorInfo);

  return errorInfo;
}
