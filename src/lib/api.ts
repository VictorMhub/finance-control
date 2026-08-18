import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function requireUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
}

export function badRequest(message = 'Dados inválidos.') {
  return NextResponse.json({ error: message }, { status: 400 });
}
