import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { badRequest, requireUserId, unauthorized } from '@/lib/api';
import { categorySchema } from '@/lib/schemas';
import { assertSameOrigin, sanitizeText } from '@/lib/security';

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return unauthorized();

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ type: 'asc' }, { name: 'asc' }]
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return unauthorized();
  if (!assertSameOrigin()) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });

  const payload = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(payload);
  if (!parsed.success) return badRequest('Categoria inválida.');

  const category = await prisma.category.create({
    data: {
      userId,
      name: sanitizeText(parsed.data.name),
      color: parsed.data.color,
      type: parsed.data.type ?? null
    }
  });

  return NextResponse.json({ category }, { status: 201 });
}
