'use client';
import { Box, SimpleGrid, Stat, StatLabel, StatNumber, Text, useColorModeValue } from '@chakra-ui/react';
import { toCurrency } from '@/utils/finance';

type Props = {
  title: string;
  value: number;
  tone?: 'income' | 'expense' | 'goal' | 'neutral';
  helper?: string;
};

export function SummaryCard({ title, value, tone = 'neutral', helper }: Props) {
  const colors = {
    income: 'finance.income',
    expense: 'finance.expense',
    goal: 'finance.goal',
    neutral: 'gray.700'
  };

  return (
    <Box bg={useColorModeValue('white', 'gray.800')} borderRadius="2xl" p={5} borderWidth="1px" boxShadow="sm">
      <Stat>
        <StatLabel>{title}</StatLabel>
        <StatNumber color={colors[tone]}>{toCurrency(value)}</StatNumber>
        {helper && <Text fontSize="sm" color="gray.500">{helper}</Text>}
      </Stat>
    </Box>
  );
}

export function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>{children}</SimpleGrid>;
}
