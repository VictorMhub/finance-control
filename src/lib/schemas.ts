import { z } from 'zod';

const money = z.coerce.number().finite().min(0.01).max(999999999.99);
const nonEmpty = z.string().trim().min(1).max(120);

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
  captchaToken: z.string().min(1, 'Confirme o CAPTCHA')
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(80),
  monthlyIncome: z.coerce.number().finite().min(0).max(999999999.99).default(0)
});

export const categorySchema = z.object({
  name: nonEmpty,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  type: z.enum(['INCOME', 'EXPENSE']).optional().nullable()
});

export const transactionSchema = z.object({
  amount: money,
  description: nonEmpty,
  date: z.coerce.date(),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().cuid(),
  isFixed: z.coerce.boolean().default(false)
});

export const transactionFilterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  categoryId: z.string().cuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional()
});

export const goalSchema = z.object({
  title: nonEmpty,
  targetAmount: money,
  savedAmount: z.coerce.number().finite().min(0).max(999999999.99).default(0),
  monthlyContribution: money,
  monthlyIncome: z.coerce.number().finite().min(0).max(999999999.99).default(0)
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
