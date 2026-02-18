'use client';

import { Button, Card, Flex, Box, Text } from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Flex minH="100vh" align="center" justify="center" p="4">
      <Card.Root w="full" maxW="md">
        <Card.Header textAlign="center">
          <Flex mx="auto" mb="4" h="12" w="12" align="center" justify="center" borderRadius="full" bg="red.50">
            <AlertTriangle size={24} color="var(--chakra-colors-destructive)" />
          </Flex>
          <Card.Title>Something went wrong</Card.Title>
          <Card.Description>
            An unexpected error occurred. Please try again.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Flex direction="column" gap="4">
            {process.env.NODE_ENV === 'development' && (
              <Box borderRadius="md" bg="muted" p="3">
                <Text as="code" fontSize="xs" color="red.600" wordBreak="break-all">
                  {error.message}
                </Text>
              </Box>
            )}
            <Flex gap="2">
              <Button onClick={reset} flex="1">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                flex="1"
              >
                Go Home
              </Button>
            </Flex>
          </Flex>
        </Card.Body>
      </Card.Root>
    </Flex>
  );
}
