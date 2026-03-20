// @TASK P1-R1-T2 - Auth validation schema tests
// @SPEC docs/planning/02-trd.md#Auth-API

import { describe, it, expect } from 'vitest';
import { signUpSchema, signInSchema } from '@/lib/validations/auth';

describe('signUpSchema', () => {
  const validData = {
    email: 'test@example.com',
    password: 'password123',
    nickname: 'testuser',
  };

  it('should validate correct signup data', () => {
    const result = signUpSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept optional industry and company_size', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      industry: 'tech',
      company_size: '1-10',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short password (< 8 chars)', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      password: '1234567',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short nickname (< 2 chars)', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      nickname: 'a',
    });
    expect(result.success).toBe(false);
  });

  it('should reject long nickname (> 20 chars)', () => {
    const result = signUpSchema.safeParse({
      ...validData,
      nickname: 'a'.repeat(21),
    });
    expect(result.success).toBe(false);
  });

  it('should allow empty optional fields', () => {
    const result = signUpSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.industry).toBeUndefined();
      expect(result.data.company_size).toBeUndefined();
    }
  });
});

describe('signInSchema', () => {
  it('should validate correct signin data', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'mypassword',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'bad-email',
      password: 'mypassword',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});
