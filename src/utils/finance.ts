import type { CategorySummary, MonthlySummary, TransactionView } from '@/types/finance';

export function toCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function calculateBalance(transactions: TransactionView[]) {
  return transactions.reduce((total, transaction) => {
    return transaction.type === 'INCOME' ? total + transaction.amount : total - transaction.amount;
  }, 0);
}

export function getDailyBalance(transactions: TransactionView[], date = new Date()) {
  const target = toDateInputValue(date);
  return calculateBalance(
    transactions.filter((transaction) => toDateInputValue(new Date(transaction.date)) === target)
  );
}

export function getTopExpenseCategories(transactions: TransactionView[], limit = 3): CategorySummary[] {
  const totals = new Map<string, CategorySummary>();

  transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .forEach((transaction) => {
      const current = totals.get(transaction.category.id) ?? {
        name: transaction.category.name,
        color: transaction.category.color,
        total: 0
      };
      current.total += transaction.amount;
      totals.set(transaction.category.id, current);
    });

  return [...totals.values()].sort((a, b) => b.total - a.total).slice(0, limit);
}

export function getMonthlySummary(transactions: TransactionView[]): MonthlySummary {
  const income = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
    fixedExpenses: transactions.filter((transaction) => transaction.type === 'EXPENSE' && transaction.isFixed),
    topCategories: getTopExpenseCategories(transactions, 3)
  };
}

export function currentMonthRange(date = new Date()) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}
