import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

describe('AppShell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/transactions');
  });

  it('renders navigation, user name, and signs out', async () => {
    const user = userEvent.setup();
    renderWithChakra(<AppShell userName="Maria">Conteúdo protegido</AppShell>);

    expect(screen.getByText('Olá, Maria')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
    expect(screen.getAllByText('Transações')).toHaveLength(2);
    expect(screen.getAllByText('Transações')[0]).toHaveAttribute('href', '/transactions');

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });

  it('toggles color mode from the header button', async () => {
    const user = userEvent.setup();
    renderWithChakra(<AppShell userName="Maria">Dashboard</AppShell>);

    await user.click(screen.getByRole('button', { name: 'Alternar modo escuro' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Alternar modo escuro' })).toBeInTheDocument());
  });
});
