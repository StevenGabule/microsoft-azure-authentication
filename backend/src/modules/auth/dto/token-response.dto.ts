export class TokenResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  mfaRequired: boolean;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    role: string;
    mfaEnabled: boolean;
  };
}
