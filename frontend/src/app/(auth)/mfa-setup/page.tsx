import { MfaSetupWizard } from '@/components/auth/mfa-setup-wizard';

export default function MfaSetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <MfaSetupWizard />
    </div>
  );
}
