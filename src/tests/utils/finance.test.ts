import { calculateBalance, getDailyBalance, getMonthlySummary, getTopExpenseCategories, toCurrency } from '@/utils/finance';
import type { TransactionView } from '@/types/finance';

const transactions: TransactionView[] = [
  {
    id: '1',
    amount: 5000,
    description: 'Salário',
    date: '2026-08-18T10:00:00.000Z',
    type: 'INCOME',
    isFixed: true,
    category: { id: 'income', name: 'Salário', color: '#16a34a' }
  },
  {
    id: '2',
    amount: 1200,
    description: 'Aluguel',
    date: '2026-08-18T12:00:00.000Z',
    type: 'EXPENSE',
    isFixed: true,
    category: { id: 'home', name: 'Moradia', color: '#dc2626' }
  },
  {
    id: '3',
    amount: 600,
    description: 'Mercado',
    date: '2026-08-19T12:00:00.000Z',
    type: 'EXPENSE',
    isFixed: false,
    category: { id: 'food', name: 'Alimentação', color: '#f97316' }
  }
];

describe('finance utilities', () => {
  it('calculates balances from income and expenses', () => {
    expect(calculateBalance(transactions)).toBe(3200);
    expect(getDailyBalance(transactions, new Date('2026-08-18T20:00:00.000Z'))).toBe(3800);
  });

  it('summarizes monthly values and fixed expenses', () => {
    const summary = getMonthlySummary(transactions);
    expect(summary.income).toBe(5000);
    expect(summary.expenses).toBe(1800);
    expect(summary.balance).toBe(3200);
    expect(summary.fixedExpenses).toHaveLength(1);
  });

  it('orders top expense categories', () => {
    expect(getTopExpenseCategories(transactions)).toEqual([
      { name: 'Moradia', total: 1200, color: '#dc2626' },
      { name: 'Alimentação', total: 600, color: '#f97316' }
    ]);
  });

  it('formats currency in Brazilian Portuguese', () => {
    expect(toCurrency(10)).toContain('10,00');
  });
});
