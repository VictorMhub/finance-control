import dynamic from 'next/dynamic';
import { Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { prisma } from '@/lib/prisma';
import { currentMonthRange, getDailyBalance, getMonthlySummary } from '@/utils/finance';
import { SummaryCard, SummaryGrid } from '@/components/dashboard/SummaryCard';
import { TransactionList } from '@/components/transactions/TransactionList';
import { requireUserId } from '@/lib/api';

const CategoryChart = dynamic(
  () => import('@/components/dashboard/CategoryChart').then((mod) => mod.CategoryChart),
  { ssr: false }
);

export default async function DashboardPage() {
  const userId = await requireUserId();
  const { from, to } = currentMonthRange();
  const transactions = await prisma.transaction.findMany({
    where: { userId: userId ?? '', date: { gte: from, lte: to } },
    include: { category: { select: { id: true, name: true, color: true } } },
    orderBy: { date: 'desc' }
  });
  const mapped = transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount) }));
  const dailyBalance = getDailyBalance(mapped);
  const monthly = getMonthlySummary(mapped);

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="lg">Dashboard</Heading>
        <Text color="gray.500">Resumo do seu mês financeiro.</Text>
      </Stack>

      <SummaryGrid>
        <SummaryCard title="Balanço diário" value={dailyBalance} tone={dailyBalance >= 0 ? 'income' : 'expense'} />
        <SummaryCard title="Receitas do mês" value={monthly.income} tone="income" />
        <SummaryCard title="Despesas do mês" value={monthly.expenses} tone="expense" />
        <SummaryCard title="Saldo final" value={monthly.balance} tone={monthly.balance >= 0 ? 'income' : 'expense'} />
      </SummaryGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
        <CategoryChart data={monthly.topCategories} />
        <TransactionList transactions={monthly.fixedExpenses} />
      </SimpleGrid>

      <TransactionList transactions={mapped.slice(0, 8)} />
    </Stack>
  );
}
