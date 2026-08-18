import { Heading, Stack, Text } from '@chakra-ui/react';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/api';
import { TransactionsClient } from '@/components/transactions/TransactionsClient';

export default async function TransactionsPage() {
  const userId = await requireUserId();
  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: userId ?? '' },
      include: { category: { select: { id: true, name: true, color: true } } },
      orderBy: { date: 'desc' }
    }),
    prisma.category.findMany({ where: { userId: userId ?? '' }, orderBy: { name: 'asc' } })
  ]);

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="lg">Transações</Heading>
        <Text color="gray.500">Cadastre receitas, despesas e gastos fixos mensais.</Text>
      </Stack>
      <TransactionsClient
        categories={categories}
        initialTransactions={transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount) }))}
      />
    </Stack>
  );
}
