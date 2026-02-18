import { LoginButton } from '@/components/auth/login-button';
import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react';
import { Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <Flex minH="100vh" direction="column">
      <Box as="header">
        <Container maxW="7xl">
          <Flex h="14" align="center">
            <Flex align="center" gap="2">
              <Shield size={24} color="var(--chakra-colors-primary)" />
              <Text fontSize="lg" fontWeight="semibold">Azure Auth Portal</Text>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Flex as="main" flex="1" align="center" justify="center">
        <Box textAlign="center" px="4">
          <Flex mx="auto" h="20" w="20" align="center" justify="center" borderRadius="full" bg="primary/10" mb="6">
            <Shield size={40} color="var(--chakra-colors-primary)" />
          </Flex>
          <Heading size="3xl" letterSpacing="tight" mb="4">
            Microsoft Azure AD
            <br />
            Authentication System
          </Heading>
          <Text mx="auto" maxW="lg" fontSize="lg" color="fg.muted" mb="6">
            Enterprise-grade authentication with OAuth 2.0, two-factor authentication,
            and role-based access control.
          </Text>
          <Flex justify="center" gap="4">
            <LoginButton />
          </Flex>
        </Box>
      </Flex>

      <Box as="footer" borderTopWidth="1px" py="6">
        <Container maxW="7xl">
          <Text textAlign="center" fontSize="sm" color="fg.muted">
            Secured with Microsoft Entra ID
          </Text>
        </Container>
      </Box>
    </Flex>
  );
}
