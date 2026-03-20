// @TASK P2-R2-T4 - Share token generation
// @SPEC docs/planning/02-trd.md#dna-share

import { randomUUID } from 'crypto';

/**
 * Generate a unique share token for DNA results.
 * Uses crypto.randomUUID() for cryptographically secure UUID v4.
 */
export function generateShareToken(): string {
  return randomUUID();
}
