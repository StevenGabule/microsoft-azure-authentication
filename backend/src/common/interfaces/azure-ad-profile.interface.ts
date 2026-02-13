export interface AzureAdProfile {
  oid: string;
  sub: string;
  email: string;
  preferred_username: string;
  name: string;
  given_name?: string;
  family_name?: string;
}

export interface MicrosoftGraphProfile {
  id: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  photo?: string;
}
