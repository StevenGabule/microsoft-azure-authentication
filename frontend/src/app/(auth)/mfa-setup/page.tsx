import { Flex } from '@chakra-ui/react';
import { MfaSetupWizard } from '@/components/auth/mfa-setup-wizard';

export default function MfaSetupPage() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="bg" p="4">
      <MfaSetupWizard />
    </Flex>
  );
}
