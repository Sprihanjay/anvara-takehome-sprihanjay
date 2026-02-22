import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { AdSlotForm } from '../components/ad-slot-form';

export default async function NewAdSlotPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'publisher' || !roleData.publisherId) {
    redirect('/');
  }

  return (
    <div className="space-y-4">
      <div className="items-center grid gap-1">
        <h1 className="text-2xl font-bold">Create New Ad Slot</h1>
        <div className=' text-sm text-gray-600'>
          Set up a new ad slot
        </div>
      </div>

      <div className="bg-white text-black rounded-4xl border shadow-xl p-6 gap-4 border-gray-50">
        <AdSlotForm />
      </div>
    </div>
  );
}
