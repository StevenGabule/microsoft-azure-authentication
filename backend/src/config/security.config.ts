import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  sessionSecret: process.env.SESSION_SECRET,
  mfaEncryptionKey: process.env.MFA_ENCRYPTION_KEY,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  sessionIdleTimeout: parseInt(process.env.SESSION_IDLE_TIMEOUT || '1800', 10), // 30 min
  sessionAbsoluteTimeout: parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT || '86400', 10), // 24h
}));
