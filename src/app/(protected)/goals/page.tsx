import { Heading, Stack, Text } from '@chakra-ui/react';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/api';
import { GoalsClient } from '@/components/goals/GoalsClient';

export default async function GoalsPage() {
  const userId = await requireUserId();
  const [user, goals] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId ?? '' }, select: { monthlyIncome: true } }),
    prisma.goal.findMany({ where: { userId: userId ?? '' }, orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="lg">Metas financeiras</Heading>
        <Text color="gray.500">Planeje objetivos, prazo e dificuldade conforme sua renda.</Text>
      </Stack>
      <GoalsClient
        monthlyIncome={Number(user?.monthlyIncome ?? 0)}
        initialGoals={goals.map((goal) => ({
          ...goal,
          targetAmount: Number(goal.targetAmount),
          savedAmount: Number(goal.savedAmount),
          monthlyContribution: Number(goal.monthlyContribution)
        }))}
      />
    </Stack>
  );
}
