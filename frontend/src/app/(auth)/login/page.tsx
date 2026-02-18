import { LoginButton } from '@/components/auth/login-button';
import { Card, Flex, Text } from '@chakra-ui/react';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="bg" p="4">
      <Card.Root w="full" maxW="md">
        <Card.Header textAlign="center">
          <Flex mx="auto" mb="4" h="16" w="16" align="center" justify="center" borderRadius="full" bg="primary/10">
            <Shield size={32} color="var(--chakra-colors-primary)" />
          </Flex>
          <Card.Title fontSize="2xl">Azure Auth Portal</Card.Title>
          <Card.Description>
            Sign in with your Microsoft account to continue
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Flex direction="column" align="center" gap="4">
            <LoginButton />
            <Text textAlign="center" fontSize="xs" color="fg.muted">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </Flex>
        </Card.Body>
      </Card.Root>
    </Flex>
  );
}
