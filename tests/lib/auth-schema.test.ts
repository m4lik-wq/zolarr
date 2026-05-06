import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  resetRequestSchema,
  resetSchema,
  profileEditSchema,
} from '@/lib/validation/auth-schema';

describe('auth schemas', () => {
  it('loginSchema rejects empty password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(r.success).toBe(false);
  });

  it('loginSchema accepts valid input', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: 'X1abcdef' });
    expect(r.success).toBe(true);
  });

  it('registerSchema rejects mismatched passwords', () => {
    const r = registerSchema.safeParse({
      name: 'Ahmet',
      email: 'a@b.com',
      password: 'X1abcdef',
      passwordConfirm: 'different',
      kvkkAccepted: true,
    });
    expect(r.success).toBe(false);
  });

  it('registerSchema requires KVKK acceptance', () => {
    const r = registerSchema.safeParse({
      name: 'Ahmet',
      email: 'a@b.com',
      password: 'X1abcdef',
      passwordConfirm: 'X1abcdef',
      kvkkAccepted: false,
    });
    expect(r.success).toBe(false);
  });

  it('registerSchema rejects weak password (<8 chars)', () => {
    const r = registerSchema.safeParse({
      name: 'Ahmet',
      email: 'a@b.com',
      password: 'short',
      passwordConfirm: 'short',
      kvkkAccepted: true,
    });
    expect(r.success).toBe(false);
  });

  it('resetRequestSchema accepts valid email', () => {
    expect(resetRequestSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });

  it('resetSchema rejects mismatched passwords', () => {
    const r = resetSchema.safeParse({ password: 'X1abcdef', passwordConfirm: 'other' });
    expect(r.success).toBe(false);
  });

  it('profileEditSchema accepts name + phone', () => {
    expect(profileEditSchema.safeParse({ name: 'Ahmet', phone: '+90' }).success).toBe(true);
  });
});
