import { IsNotEmpty, IsString } from 'class-validator';

export class AzureAdCallbackDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
