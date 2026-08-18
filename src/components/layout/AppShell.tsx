'use client';

import NextLink from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Transações' },
  { href: '/goals', label: 'Metas' }
];

export function AppShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const pathname = usePathname();
  const { colorMode, toggleColorMode } = useColorMode();
  const surface = useColorModeValue('white', 'gray.800');
  const bg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bg} pb={{ base: 24, md: 0 }}>
      <Box as="header" bg={surface} borderBottomWidth="1px" position="sticky" top={0} zIndex={10}>
        <Container maxW="6xl" py={4}>
          <Flex justify="space-between" align="center" gap={4}>
            <Stack spacing={0}>
              <Text fontWeight="bold" color="brand.600">Finance Control</Text>
              <Text fontSize="sm" color="gray.500">Olá, {userName}</Text>
            </Stack>
            <HStack display={{ base: 'none', md: 'flex' }} spacing={4}>
              {navItems.map((item) => (
                <Link
                  as={NextLink}
                  key={item.href}
                  href={item.href}
                  fontWeight={pathname === item.href ? 'bold' : 'medium'}
                  color={pathname === item.href ? 'brand.600' : 'gray.600'}
                >
                  {item.label}
                </Link>
              ))}
            </HStack>
            <HStack>
              <IconButton
                aria-label="Alternar modo escuro"
                size="sm"
                variant="ghost"
                onClick={toggleColorMode}
                icon={<span>{colorMode === 'dark' ? '☀' : '☾'}</span>}
              />
              <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: '/login' })}>Sair</Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container as="main" maxW="6xl" py={6}>{children}</Container>

      <Flex
        as="nav"
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg={surface}
        borderTopWidth="1px"
        justify="space-around"
        py={3}
        zIndex={20}
      >
        {navItems.map((item) => (
          <Link
            as={NextLink}
            key={item.href}
            href={item.href}
            fontSize="sm"
            fontWeight={pathname === item.href ? 'bold' : 'medium'}
            color={pathname === item.href ? 'brand.600' : 'gray.500'}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </Flex>
    </Box>
  );
}
