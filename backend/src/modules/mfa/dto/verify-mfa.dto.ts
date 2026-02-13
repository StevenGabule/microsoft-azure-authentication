import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  recoveryCode?: string;
}
