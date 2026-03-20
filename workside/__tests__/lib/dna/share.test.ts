// @TASK P2-R2-T4 - Share token generation tests
// @SPEC docs/planning/02-trd.md#dna-share

import { describe, it, expect } from 'vitest';
import { generateShareToken } from '@/lib/dna/share';

describe('generateShareToken', () => {
  it('should return a valid UUID v4 string', () => {
    const token = generateShareToken();
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(token).toMatch(uuidV4Regex);
  });

  it('should generate unique tokens on each call', () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateShareToken());
    }
    expect(tokens.size).toBe(100);
  });

  it('should return a string of length 36', () => {
    const token = generateShareToken();
    expect(token).toHaveLength(36);
  });
});
