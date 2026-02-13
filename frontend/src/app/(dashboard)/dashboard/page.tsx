'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Activity, Key } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.displayName || user?.email || 'User'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="success">Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{user?.role || 'USER'}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MFA Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={user?.mfaEnabled ? 'success' : 'outline'}>
              {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/settings/security" className="text-sm text-primary hover:underline">
              Manage Settings
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/profile"
              className="flex items-center rounded-md p-2 text-sm hover:bg-accent transition-colors"
            >
              View & Edit Profile
            </Link>
            <Link
              href="/settings/security"
              className="flex items-center rounded-md p-2 text-sm hover:bg-accent transition-colors"
            >
              Security Settings
            </Link>
            {!user?.mfaEnabled && (
              <Link
                href="/mfa-setup"
                className="flex items-center rounded-md p-2 text-sm text-primary hover:bg-accent transition-colors"
              >
                Enable Two-Factor Authentication
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
            <CardDescription>Your Microsoft account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{user?.displayName || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span>{user?.role}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
