'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import type { TransactionView } from '@/types/finance';
import { toDateInputValue } from '@/utils/finance';

type Category = { id: string; name: string; color: string; type: 'INCOME' | 'EXPENSE' | null };

type Props = {
  categories: Category[];
  onSaved(transaction: TransactionView): void;
  editing?: TransactionView | null;
  onCancelEdit?(): void;
};

export function TransactionForm({ categories, onSaved, editing, onCancelEdit }: Props) {
  const toast = useToast();
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(editing?.type ?? 'EXPENSE');
  const [loading, setLoading] = useState(false);
  const availableCategories = useMemo(
    () => categories.filter((category) => !category.type || category.type === type),
    [categories, type]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      amount: Number(form.get('amount')),
      description: String(form.get('description') ?? ''),
      date: String(form.get('date')),
      type,
      categoryId: String(form.get('categoryId') ?? ''),
      isFixed: form.get('isFixed') === 'on'
    };

    const response = await fetch(editing ? `/api/transactions/${editing.id}` : '/api/transactions', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = (await response.json().catch(() => ({}))) as { transaction?: TransactionView; error?: string };
    setLoading(false);

    if (!response.ok || !body.transaction) {
      toast({ status: 'error', title: body.error ?? 'Erro ao salvar transação.' });
      return;
    }

    toast({ status: 'success', title: editing ? 'Transação atualizada.' : 'Transação criada.' });
    onSaved(body.transaction);
    formElement.reset();
    onCancelEdit?.();
  }

  return (
    <Box bg="white" _dark={{ bg: 'gray.800' }} borderRadius="2xl" p={5} borderWidth="1px" boxShadow="sm">
      <Text fontWeight="bold" mb={4}>{editing ? 'Editar transação' : 'Nova transação'}</Text>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel htmlFor="description">Descrição</FormLabel>
              <Input id="description" name="description" defaultValue={editing?.description} maxLength={120} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="amount">Valor</FormLabel>
              <Input id="amount" name="amount" type="number" min={0.01} step="0.01" defaultValue={editing?.amount} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="date">Data</FormLabel>
              <Input id="date" name="date" type="date" defaultValue={editing ? toDateInputValue(new Date(editing.date)) : toDateInputValue(new Date())} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="type">Tipo</FormLabel>
              <Select id="type" value={type} onChange={(event) => setType(event.target.value as 'INCOME' | 'EXPENSE')}>
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="categoryId">Categoria</FormLabel>
              <Select id="categoryId" name="categoryId" defaultValue={editing?.category.id ?? availableCategories[0]?.id}>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl display="flex" alignItems="end">
              <Checkbox name="isFixed" defaultChecked={editing?.isFixed}>Gasto fixo mensal</Checkbox>
            </FormControl>
          </SimpleGrid>
          <HStack>
            <Button type="submit" isLoading={loading}>{editing ? 'Salvar edição' : 'Adicionar'}</Button>
            {editing && <Button variant="ghost" onClick={onCancelEdit}>Cancelar</Button>}
          </HStack>
        </Stack>
      </form>
    </Box>
  );
}
