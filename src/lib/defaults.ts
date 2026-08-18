import { calculateGoalDifficulty } from '@/utils/goals';

export const defaultCategories = [
  { name: 'Salário', color: '#16a34a', type: 'INCOME' as const, isDefault: true },
  { name: 'Freelance', color: '#22c55e', type: 'INCOME' as const, isDefault: true },
  { name: 'Moradia', color: '#dc2626', type: 'EXPENSE' as const, isDefault: true },
  { name: 'Alimentação', color: '#f97316', type: 'EXPENSE' as const, isDefault: true },
  { name: 'Transporte', color: '#eab308', type: 'EXPENSE' as const, isDefault: true },
  { name: 'Saúde', color: '#0891b2', type: 'EXPENSE' as const, isDefault: true },
  { name: 'Investimento/Poupança', color: '#2563eb', type: 'EXPENSE' as const, isDefault: true }
];

export { calculateGoalDifficulty };
