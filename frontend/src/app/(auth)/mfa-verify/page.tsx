import { MfaVerifyForm } from '@/components/auth/mfa-verify-form';

export default function MfaVerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <MfaVerifyForm />
    </div>
  );
}
