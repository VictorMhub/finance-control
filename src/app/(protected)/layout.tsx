import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { AppShell } from '@/components/layout/AppShell';
import { authOptions } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return <AppShell userName={session.user?.name ?? session.user?.email ?? 'Usuário'}>{children}</AppShell>;
}
