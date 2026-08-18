import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { TransactionList } from '@/components/transactions/TransactionList';
import type { TransactionView } from '@/types/finance';

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

describe('dashboard components', () => {
  it('renders a formatted summary value', () => {
    renderWithChakra(<SummaryCard title="Saldo" value={1234.56} tone="income" />);
    expect(screen.getByText('Saldo')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*1\.234,56/)).toBeInTheDocument();
  });

  it('renders transaction rows with fixed badge', () => {
    const transactions: TransactionView[] = [
      {
        id: 'tx1',
        amount: 1200,
        description: 'Aluguel',
        date: '2026-08-10T00:00:00.000Z',
        type: 'EXPENSE',
        isFixed: true,
        category: { id: 'cat1', name: 'Moradia', color: '#dc2626' }
      }
    ];

    renderWithChakra(<TransactionList transactions={transactions} />);
    expect(screen.getByText('Aluguel')).toBeInTheDocument();
    expect(screen.getByText('Fixo')).toBeInTheDocument();
    expect(screen.getByText(/Moradia/)).toBeInTheDocument();
  });
});
