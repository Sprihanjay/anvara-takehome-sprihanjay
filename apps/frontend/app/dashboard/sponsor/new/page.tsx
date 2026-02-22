import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
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
    <div className="space-y-4">
      <div className="items-center grid gap-1">
        <h1 className="text-2xl font-bold">Create New Campaign</h1>
        <div className=' text-sm text-gray-600'>
          Set up a new campaign
        </div>
      </div>

      <div className="bg-white text-black rounded-4xl border shadow-xl p-6 gap-4 border-gray-50">
        <CampaignForm />
      </div>
    </div>
  );
}
