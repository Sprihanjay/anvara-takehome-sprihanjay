import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/publisher"
          className="text-[--color-muted] hover:text-[--color-foreground]"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Create New Ad Slot</h1>
      </div>

      <div className="rounded-lg border border-[--color-border] bg-white p-6">
        <AdSlotForm />
      </div>
    </div>
  );
}
