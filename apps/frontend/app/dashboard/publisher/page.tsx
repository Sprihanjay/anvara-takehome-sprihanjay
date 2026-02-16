import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getPublisherAdSlots } from '@/lib/data/publisher';
import { AdSlotList } from './components/ad-slot-list';

export default async function PublisherDashboard() {
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

  const adSlots = await getPublisherAdSlots(roleData.publisherId);

  return (
    <div className="space-y-6">
      <AdSlotList adSlots={adSlots} />
    </div>
  );
}
