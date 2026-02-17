import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { CampaignForm } from '../components/campaign-form';

export default async function NewCampaignPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'sponsor' || !roleData.sponsorId) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/sponsor"
          className="text-[--color-muted] hover:text-[--color-foreground]"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Create New Campaign</h1>
      </div>

      <div className="rounded-lg border border-[--color-border] bg-white p-6">
        <CampaignForm />
      </div>
    </div>
  );
}
