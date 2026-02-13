'use client';

import { useUserProfile } from '@/hooks/queries/use-user-profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Briefcase, Building, Calendar, Shield } from 'lucide-react';

export function ProfileCard() {
  const { data: profile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  const initials = `${(profile.firstName || profile.displayName || '')?.[0] || ''}`.toUpperCase();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName || ''} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile.displayName || 'No Name'}</CardTitle>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">{profile.role}</Badge>
              {profile.mfaEnabled && (
                <Badge variant="success">
                  <Shield className="mr-1 h-3 w-3" /> MFA Enabled
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>
          {profile.jobTitle && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{profile.jobTitle}</span>
            </div>
          )}
          {profile.department && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{profile.department}</span>
            </div>
          )}
          {profile.lastLoginAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Last login: {new Date(profile.lastLoginAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
