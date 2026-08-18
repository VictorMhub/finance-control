import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { badRequest, requireUserId, unauthorized } from '@/lib/api';
import { goalSchema } from '@/lib/schemas';
import { assertSameOrigin, sanitizeText } from '@/lib/security';
import { calculateGoalDifficulty } from '@/utils/goals';

type Params = { params: { id: string } };

function serializeGoal(goal: {
  id: string;
  title: string;
  targetAmount: unknown;
  savedAmount: unknown;
  monthlyContribution: unknown;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
}) {
  return {
    ...goal,
    targetAmount: Number(goal.targetAmount),
    savedAmount: Number(goal.savedAmount),
    monthlyContribution: Number(goal.monthlyContribution)
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  if (!assertSameOrigin()) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const payload = await request.json().catch(() => null);
  const parsed = goalSchema.safeParse(payload);
  if (!parsed.success) return badRequest('Meta inválida.');

  const exists = await prisma.goal.findFirst({ where: { id: params.id, userId } });
  if (!exists) return NextResponse.json({ error: 'Meta não encontrada.' }, { status: 404 });

  const goal = await prisma.goal.update({
    where: { id: params.id },
    data: {
      title: sanitizeText(parsed.data.title),
      targetAmount: parsed.data.targetAmount,
      savedAmount: parsed.data.savedAmount,
      monthlyContribution: parsed.data.monthlyContribution,
      difficulty: calculateGoalDifficulty(parsed.data.monthlyContribution, parsed.data.monthlyIncome)
    }
  });

  return NextResponse.json({ goal: serializeGoal(goal) });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  if (!assertSameOrigin()) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const goal = await prisma.goal.findFirst({ where: { id: params.id, userId } });
  if (!goal) return NextResponse.json({ error: 'Meta não encontrada.' }, { status: 404 });

  await prisma.goal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
