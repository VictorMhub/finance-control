import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Finance Control',
  description: 'Controle financeiro pessoal seguro e mobile-first'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
