'use client';
import { Badge, Box, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import type { TransactionView } from '@/types/finance';
import { toCurrency } from '@/utils/finance';

export function TransactionList({ transactions }: { transactions: TransactionView[] }) {
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bg} borderRadius="2xl" p={5} borderWidth="1px" boxShadow="sm">
      <Text fontWeight="bold" mb={4}>Transações</Text>
      <Stack spacing={3}>
        {transactions.length === 0 && <Text color="gray.500">Nenhuma transação encontrada.</Text>}
        {transactions.map((transaction) => (
          <HStack key={transaction.id} justify="space-between" align="start" borderBottomWidth="1px" pb={3}>
            <Stack spacing={1}>
              <HStack>
                <Text fontWeight="medium">{transaction.description}</Text>
                {transaction.isFixed && <Badge colorScheme="blue">Fixo</Badge>}
              </HStack>
              <Text fontSize="sm" color="gray.500">
                {transaction.category.name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
              </Text>
            </Stack>
            <Text fontWeight="bold" color={transaction.type === 'INCOME' ? 'finance.income' : 'finance.expense'}>
              {transaction.type === 'INCOME' ? '+' : '-'} {toCurrency(transaction.amount)}
            </Text>
          </HStack>
        ))}
      </Stack>
    </Box>
  );
}
