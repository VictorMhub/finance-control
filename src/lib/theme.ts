import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true
};

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#e8f3ff',
      100: '#c7def5',
      500: '#2563eb',
      600: '#1d4ed8',
      700: '#1e40af'
    },
    finance: {
      income: '#16a34a',
      expense: '#dc2626',
      goal: '#2563eb'
    }
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif'
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.900'
      }
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand'
      }
    }
  }
});
