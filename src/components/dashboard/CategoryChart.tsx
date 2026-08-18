'use client';

import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategorySummary } from '@/types/finance';
import { toCurrency } from '@/utils/finance';

export function CategoryChart({ data }: { data: CategorySummary[] }) {
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bg} borderRadius="2xl" p={5} borderWidth="1px" boxShadow="sm" minH="280px">
      <Text fontWeight="bold" mb={4}>Categorias com maior gasto</Text>
      {data.length === 0 ? (
        <Text color="gray.500">Nenhuma despesa registrada no mês.</Text>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
              {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(value) => toCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
