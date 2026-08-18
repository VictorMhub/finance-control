export type TransactionType = 'INCOME' | 'EXPENSE';

export type CategorySummary = {
  name: string;
  total: number;
  color: string;
};

export type TransactionView = {
  id: string;
  amount: number;
  description: string;
  date: string | Date;
  type: TransactionType;
  isFixed: boolean;
  category: {
    id: string;
    name: string;
    color: string;
  };
};

export type MonthlySummary = {
  income: number;
  expenses: number;
  balance: number;
  fixedExpenses: TransactionView[];
  topCategories: CategorySummary[];
};
