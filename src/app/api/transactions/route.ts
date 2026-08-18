import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { badRequest, requireUserId, unauthorized } from '@/lib/api';
import { transactionFilterSchema, transactionSchema } from '@/lib/schemas';
import { assertSameOrigin, sanitizeText } from '@/lib/security';

function serializeTransaction(transaction: Awaited<ReturnType<typeof prisma.transaction.findMany>>[number]) {
  return { ...transaction, amount: Number(transaction.amount) };
}

export async function GET(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = transactionFilterSchema.safeParse(params);
  if (!filters.success) return badRequest('Filtros inválidos.');

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: filters.data.type,
      categoryId: filters.data.categoryId,
      date: {
        gte: filters.data.from,
        lte: filters.data.to
      }
    },
    include: { category: { select: { id: true, name: true, color: true } } },
    orderBy: { date: 'desc' }
  });

  return NextResponse.json({ transactions: transactions.map(serializeTransaction) });
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  if (!assertSameOrigin()) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const payload = await request.json().catch(() => null);
  const parsed = transactionSchema.safeParse(payload);
  if (!parsed.success) return badRequest('Transação inválida.');

  const category = await prisma.category.findFirst({ where: { id: parsed.data.categoryId, userId } });
  if (!category) return badRequest('Categoria não encontrada.');

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      amount: parsed.data.amount,
      description: sanitizeText(parsed.data.description),
      date: parsed.data.date,
      type: parsed.data.type,
      categoryId: parsed.data.categoryId,
      isFixed: parsed.data.isFixed
    },
    include: { category: { select: { id: true, name: true, color: true } } }
  });

  return NextResponse.json({ transaction: serializeTransaction(transaction) }, { status: 201 });
}
