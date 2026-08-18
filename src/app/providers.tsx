'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { theme } from '@/lib/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CacheProvider>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </CacheProvider>
    </SessionProvider>
  );
}
