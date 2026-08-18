import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { badRequest, requireUserId, unauthorized } from '@/lib/api';
import { goalSchema } from '@/lib/schemas';
import { assertSameOrigin, sanitizeText } from '@/lib/security';
import { calculateGoalDifficulty } from '@/utils/goals';

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

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const goals = await prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ goals: goals.map(serializeGoal) });
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  if (!assertSameOrigin()) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const payload = await request.json().catch(() => null);
  const parsed = goalSchema.safeParse(payload);
  if (!parsed.success) return badRequest('Meta inválida.');

  const goal = await prisma.goal.create({
    data: {
      userId,
      title: sanitizeText(parsed.data.title),
      targetAmount: parsed.data.targetAmount,
      savedAmount: parsed.data.savedAmount,
      monthlyContribution: parsed.data.monthlyContribution,
      difficulty: calculateGoalDifficulty(parsed.data.monthlyContribution, parsed.data.monthlyIncome)
    }
  });

  return NextResponse.json({ goal: serializeGoal(goal) }, { status: 201 });
}
