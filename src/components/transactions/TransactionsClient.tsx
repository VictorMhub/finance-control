'use client';

import { useMemo, useState } from 'react';
import { Button, HStack, Select, Stack, useToast } from '@chakra-ui/react';
import type { TransactionView, TransactionType } from '@/types/finance';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';

type Category = { id: string; name: string; color: string; type: TransactionType | null };

type Props = {
  initialTransactions: TransactionView[];
  categories: Category[];
};

export function TransactionsClient({ initialTransactions, categories }: Props) {
  const toast = useToast();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [editing, setEditing] = useState<TransactionView | null>(null);
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = useMemo(
    () =>
      transactions.filter((transaction) => {
        const typeMatches = typeFilter === 'ALL' || transaction.type === typeFilter;
        const categoryMatches = categoryFilter === 'ALL' || transaction.category.id === categoryFilter;
        return typeMatches && categoryMatches;
      }),
    [categoryFilter, transactions, typeFilter]
  );

  function upsertTransaction(transaction: TransactionView) {
    setTransactions((current) => {
      const exists = current.some((item) => item.id === transaction.id);
      return exists
        ? current.map((item) => (item.id === transaction.id ? transaction : item))
        : [transaction, ...current];
    });
  }

  async function deleteTransaction(id: string) {
    const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      toast({ status: 'error', title: 'Não foi possível remover a transação.' });
      return;
    }
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
    toast({ status: 'success', title: 'Transação removida.' });
  }

  return (
    <Stack spacing={5}>
      <TransactionForm categories={categories} onSaved={upsertTransaction} editing={editing} onCancelEdit={() => setEditing(null)} />
      <HStack flexWrap="wrap">
        <Select maxW="220px" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'ALL' | TransactionType)}>
          <option value="ALL">Todos os tipos</option>
          <option value="INCOME">Receitas</option>
          <option value="EXPENSE">Despesas</option>
        </Select>
        <Select maxW="260px" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="ALL">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>
      </HStack>
      <TransactionList transactions={filtered} />
      <HStack flexWrap="wrap">
        {filtered.map((transaction) => (
          <HStack key={transaction.id} bg="white" _dark={{ bg: 'gray.800' }} p={2} borderRadius="lg" borderWidth="1px">
            <Button size="xs" variant="outline" onClick={() => setEditing(transaction)}>Editar {transaction.description}</Button>
            <Button size="xs" colorScheme="red" variant="outline" onClick={() => deleteTransaction(transaction.id)}>Excluir</Button>
          </HStack>
        ))}
      </HStack>
    </Stack>
  );
}
