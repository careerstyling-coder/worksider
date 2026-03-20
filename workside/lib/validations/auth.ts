// @TASK P1-R1-T2 - Auth validation schemas (Zod)
// @SPEC docs/planning/02-trd.md#Auth-API

import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(20, '닉네임은 20자 이하여야 합니다'),
  industry: z.string().optional(),
  company_size: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
