import { ProfileCard } from '@/components/profile/profile-card';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account profile</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard />
        <ProfileEditForm />
      </div>
    </div>
  );
}
