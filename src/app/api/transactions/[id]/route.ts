import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { badRequest, requireUserId, unauthorized } from '@/lib/api';
import { transactionSchema } from '@/lib/schemas';
import { assertSameOrigin, sanitizeText } from '@/lib/security';

type Params = { params: { id: string } };

function serializeTransaction(transaction: {
  id: string;
  amount: unknown;
  description: string;
  date: Date;
  type: 'INCOME' | 'EXPENSE';
  isFixed: boolean;
  category: { id: string; name: string; color: string };
}) {
  return { ...transaction, amount: Number(transaction.amount) };
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  if (!assertSameOrigin()) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const payload = await request.json().catch(() => null);
  const parsed = transactionSchema.safeParse(payload);
  if (!parsed.success) return badRequest('Transação inválida.');

  const transaction = await prisma.transaction.findFirst({ where: { id: params.id, userId } });
  if (!transaction) return NextResponse.json({ error: 'Transação não encontrada.' }, { status: 404 });

  const category = await prisma.category.findFirst({ where: { id: parsed.data.categoryId, userId } });
  if (!category) return badRequest('Categoria não encontrada.');

  const updated = await prisma.transaction.update({
    where: { id: params.id },
    data: {
      amount: parsed.data.amount,
      description: sanitizeText(parsed.data.description),
      date: parsed.data.date,
      type: parsed.data.type,
      isFixed: parsed.data.isFixed,
      categoryId: parsed.data.categoryId
    },
    include: { category: { select: { id: true, name: true, color: true } } }
  });

  return NextResponse.json({ transaction: serializeTransaction(updated) });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  if (!assertSameOrigin()) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const transaction = await prisma.transaction.findFirst({ where: { id: params.id, userId } });
  if (!transaction) return NextResponse.json({ error: 'Transação não encontrada.' }, { status: 404 });

  await prisma.transaction.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
