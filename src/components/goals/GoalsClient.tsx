'use client';

import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import type { GoalView } from '@/types/goals';
import { calculateGoalProgress, calculateMonthsToGoal, goalDifficultyLabel } from '@/utils/goals';
import { toCurrency } from '@/utils/finance';

export function GoalsClient({ initialGoals, monthlyIncome }: { initialGoals: GoalView[]; monthlyIncome: number }) {
  const toast = useToast();
  const [goals, setGoals] = useState(initialGoals);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      title: String(form.get('title') ?? ''),
      targetAmount: Number(form.get('targetAmount')),
      savedAmount: Number(form.get('savedAmount')),
      monthlyContribution: Number(form.get('monthlyContribution')),
      monthlyIncome
    };
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = (await response.json().catch(() => ({}))) as { goal?: GoalView; error?: string };
    setLoading(false);
    if (!response.ok || !body.goal) {
      toast({ status: 'error', title: body.error ?? 'Erro ao criar meta.' });
      return;
    }
    setGoals((current) => [body.goal!, ...current]);
    toast({ status: 'success', title: 'Meta criada.' });
    formElement.reset();
  }

  async function deleteGoal(id: string) {
    const response = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      toast({ status: 'error', title: 'Não foi possível remover a meta.' });
      return;
    }
    setGoals((current) => current.filter((goal) => goal.id !== id));
    toast({ status: 'success', title: 'Meta removida.' });
  }

  return (
    <Stack spacing={5}>
      <Box bg="white" _dark={{ bg: 'gray.800' }} borderRadius="2xl" p={5} borderWidth="1px" boxShadow="sm">
        <Text fontWeight="bold" mb={4}>Nova meta</Text>
        <form onSubmit={handleSubmit}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel htmlFor="title">Título</FormLabel>
              <Input id="title" name="title" maxLength={120} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="targetAmount">Valor alvo</FormLabel>
              <Input id="targetAmount" name="targetAmount" type="number" min={0.01} step="0.01" />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="savedAmount">Valor guardado</FormLabel>
              <Input id="savedAmount" name="savedAmount" type="number" min={0} step="0.01" defaultValue="0" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="monthlyContribution">Investimento mensal</FormLabel>
              <Input id="monthlyContribution" name="monthlyContribution" type="number" min={0.01} step="0.01" />
            </FormControl>
          </SimpleGrid>
          <Button mt={4} type="submit" isLoading={loading}>Criar meta</Button>
        </form>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {goals.map((goal) => {
          const progress = calculateGoalProgress(goal.targetAmount, goal.savedAmount);
          const months = calculateMonthsToGoal(goal.targetAmount, goal.savedAmount, goal.monthlyContribution);
          return (
            <Box key={goal.id} bg="white" _dark={{ bg: 'gray.800' }} borderRadius="2xl" p={5} borderWidth="1px" boxShadow="sm">
              <Stack spacing={3}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">{goal.title}</Text>
                  <Badge colorScheme={goal.difficulty === 'EASY' ? 'green' : goal.difficulty === 'MEDIUM' ? 'yellow' : 'red'}>
                    {goalDifficultyLabel(goal.difficulty)}
                  </Badge>
                </HStack>
                <Text color="gray.500">{toCurrency(goal.savedAmount)} de {toCurrency(goal.targetAmount)}</Text>
                <Progress value={progress} colorScheme="blue" borderRadius="full" />
                <Text fontSize="sm">{progress}% concluído • {months === Infinity ? 'sem previsão' : `${months} meses restantes`}</Text>
                <Button size="sm" variant="outline" colorScheme="red" onClick={() => deleteGoal(goal.id)}>Excluir</Button>
              </Stack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
