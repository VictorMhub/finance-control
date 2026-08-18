import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionsClient } from '@/components/transactions/TransactionsClient';
import type { TransactionView } from '@/types/finance';

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

const categories = [
  { id: 'cat1', name: 'Moradia', color: '#dc2626', type: 'EXPENSE' as const },
  { id: 'cat2', name: 'Salário', color: '#16a34a', type: 'INCOME' as const }
];

const transaction: TransactionView = {
  id: 'tx1',
  amount: 1200,
  description: 'Aluguel',
  date: '2026-08-18T00:00:00.000Z',
  type: 'EXPENSE',
  isFixed: true,
  category: { id: 'cat1', name: 'Moradia', color: '#dc2626' }
};

describe('transaction components', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('creates a transaction and calls onSaved', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ transaction }) });
    const onSaved = jest.fn();
    const user = userEvent.setup();
    renderWithChakra(<TransactionForm categories={categories} onSaved={onSaved} />);

    await user.type(screen.getByLabelText(/Descrição/), 'Aluguel');
    await user.type(screen.getByLabelText(/Valor/), '1200');
    await user.click(screen.getByLabelText('Gasto fixo mensal'));
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(transaction));
    expect(global.fetch).toHaveBeenCalledWith('/api/transactions', expect.objectContaining({ method: 'POST' }));
  });

  it('filters and removes transactions in client view', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    const user = userEvent.setup();
    renderWithChakra(<TransactionsClient initialTransactions={[transaction]} categories={categories} />);

    expect(screen.getByText('Aluguel')).toBeInTheDocument();
    await user.selectOptions(screen.getByDisplayValue('Todos os tipos'), 'INCOME');
    expect(screen.queryByText('Aluguel')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByDisplayValue('Receitas'), 'ALL');
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/transactions/tx1', { method: 'DELETE' }));
  });
});
