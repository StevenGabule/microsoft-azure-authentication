import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for Azure AD OAuth authentication flow.
 */
@Injectable()
export class AzureAdGuard extends AuthGuard('azure-ad') {}
