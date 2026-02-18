import { Header } from '@/components/layout/header';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Box, Container } from '@chakra-ui/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Box minH="100vh" bg="bg">
        <Header />
        <Container maxW="7xl" py="6" px="4">{children}</Container>
      </Box>
    </AuthGuard>
  );
}
