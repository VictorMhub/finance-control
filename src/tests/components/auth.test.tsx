import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/components/auth/ReCaptchaToken', () => ({
  ReCaptchaToken: ({
    onToken
  }: {
    onToken(token: string): void;
  }) => {
    const { useEffect } =
      jest.requireActual('react') as typeof import('react');

    useEffect(() => {
      onToken('test-captcha');
    }, [onToken]);

    return null;
  }
}));

function renderWithChakra(ui: React.ReactElement) {
  return (
    render(
      <ChakraProvider>
        {ui}
      </ChakraProvider>
    )
  );
}

describe('AuthForm', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push
    });

    global.fetch = jest.fn();
  });

  it('signs in and redirects from login', async () => {
    (signIn as jest.Mock).mockResolvedValue({
      ok: true
    });

    const user = userEvent.setup();

    renderWithChakra(
      <AuthForm mode="login" />
    );

    await user.type(
      screen.getByLabelText(/Email/),
      'maria@example.com'
    );

    await user.type(
      screen.getByLabelText(/Senha/),
      'password123'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Entrar'
      })
    );

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith(
        'credentials',
        expect.objectContaining({
          email: 'maria@example.com'
        })
      )
    );

    expect(push).toHaveBeenCalledWith(
      '/dashboard'
    );
  });

  it('registers and redirects to login without signing in automatically', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({})
    });

    const user = userEvent.setup();

    renderWithChakra(
      <AuthForm mode="register" />
    );

    await user.type(
      screen.getByLabelText(/Nome/),
      'Maria'
    );

    await user.type(
      screen.getByLabelText(/Email/),
      'maria@example.com'
    );

    await user.type(
      screen.getByLabelText(/Senha/),
      'password123'
    );

    await user.clear(
      screen.getByLabelText(/Renda mensal/)
    );

    await user.type(
      screen.getByLabelText(/Renda mensal/),
      '5000'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Cadastrar'
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/register',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/login'
      );
    });

    expect(signIn).not.toHaveBeenCalled();
  });

  it('shows friendly registration errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Email já existe.'
      })
    });

    const user = userEvent.setup();

    renderWithChakra(
      <AuthForm mode="register" />
    );

    await user.type(
      screen.getByLabelText(/Nome/),
      'Maria'
    );

    await user.type(
      screen.getByLabelText(/Email/),
      'maria@example.com'
    );

    await user.type(
      screen.getByLabelText(/Senha/),
      'password123'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Cadastrar'
      })
    );

    expect(
      await screen.findByText(
        'Email já existe.'
      )
    ).toBeInTheDocument();

    expect(push).not.toHaveBeenCalledWith(
      '/login'
    );
  });
});