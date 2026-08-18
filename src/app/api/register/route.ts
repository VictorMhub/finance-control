import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { defaultCategories } from '@/lib/defaults';
import { registerSchema } from '@/lib/schemas';
import { assertSameOrigin, sanitizeText, verifyCaptcha } from '@/lib/security';

export async function POST(request: NextRequest) {
  if (!assertSameOrigin()) {
    return NextResponse.json(
      { error: 'Origem inválida.' },
      { status: 403 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ??
    'unknown';

  if (!checkRateLimit(`register:${ip}`, 3, 60_000)) {
    return NextResponse.json(
      {
        error:
          'Muitas tentativas. Tente novamente em instantes.'
      },
      { status: 429 }
    );
  }

  const payload = await request.json().catch(() => null);

  console.log('PAYLOAD RECEBIDO:', payload);

  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    console.log(
      'ERRO REGISTER SCHEMA:',
      parsed.error.flatten()
    );

    return NextResponse.json(
      {
        error: 'Confira os dados informados.',
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  console.log('SCHEMA OK');

  const captchaOk = await verifyCaptcha(
    parsed.data.captchaToken,
    ip
  );

  console.log('CAPTCHA TOKEN:', parsed.data.captchaToken);
  console.log('CAPTCHA OK:', captchaOk);

  if (!captchaOk) {
    return NextResponse.json(
      { error: 'Falha na verificação CAPTCHA.' },
      { status: 400 }
    );
  }

  const exists = await prisma.user.findUnique({
    where: {
      email: parsed.data.email
    }
  });

  if (exists) {
    return NextResponse.json(
      { error: 'Este email já está cadastrado.' },
      { status: 409 }
    );
  }

  const passwordHash = await hash(
    parsed.data.password,
    12
  );

  const user = await prisma.user.create({
    data: {
      name: sanitizeText(parsed.data.name),
      email: parsed.data.email,
      passwordHash,
      monthlyIncome: parsed.data.monthlyIncome,
      categories: {
        create: defaultCategories
      }
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  return NextResponse.json(
    { user },
    { status: 201 }
  );
}
