'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdSlot } from '@/lib/api';
import { authClient } from '@/auth-client';

interface AdSlot {
  id: string;
  name: string;
  description?: string;
  type: string;
  position?: string;
  basePrice: number;
  pricingModel?: 'CPM' | 'CPC' | 'CPA' | 'FLAT_RATE';
  isAvailable: boolean;
  publisher?: {
    id: string;
    name: string;
    website?: string;
    monthlyViews?: number;
    subscriberCount?: number;
    category?: string;
    isVerified?: boolean;
    description?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface RoleInfo {
  role: 'sponsor' | 'publisher' | null;
  sponsorId?: string;
  publisherId?: string;
  name?: string;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

interface Props {
  id: string;
}

export function AdSlotDetail({ id }: Props) {
  const router = useRouter();
  const [adSlot, setAdSlot] = useState<AdSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch ad slot
    getAdSlot(id)
      .then(setAdSlot)
      .catch(() => setError('Failed to load ad slot details'))
      .finally(() => setLoading(false));

    // Check user session and fetch role
    authClient
      .getSession()
      .then(({ data }) => {
        if (data?.user) {
          const sessionUser = data.user as User;
          setUser(sessionUser);

          // Fetch role info from backend
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${sessionUser.id}`
          )
            .then((res) => res.json())
            .then((data) => setRoleInfo(data))
            .catch(() => setRoleInfo(null))
            .finally(() => setRoleLoading(false));
        } else {
          setRoleLoading(false);
        }
      })
      .catch(() => setRoleLoading(false));
  }, [id]);

  const handleBooking = async () => {
    if (!roleInfo?.sponsorId || !adSlot) return;

    setBooking(true);
    setBookingError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/ad-slots/${adSlot.id}/book`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            sponsorId: roleInfo.sponsorId,
            message: message || undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book placement');
      }

      setBookingSuccess(true);
      setAdSlot({ ...adSlot, isAvailable: false });
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book placement');
    } finally {
      setBooking(false);
    }
  };

  const handleUnbook = async () => {
    if (!adSlot) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/ad-slots/${adSlot.id}/unbook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reset booking');
      }

      setBookingSuccess(false);
      setAdSlot({ ...adSlot, isAvailable: true });
      setMessage('');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to reset booking');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-[--color-muted]">Loading...</div>;
  }

  if (error || !adSlot) {
    return (
      <div className="space-y-4">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error || 'Ad slot not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left Column - Details */}
      <div className="lg:col-span-2 space-y-8 bg-white p-8 rounded-4xl border border-gray-100 shadow-xl">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <h1 className="text-3xl font-bold">{adSlot.name}</h1>
            <span
              className={`rounded-lg px-3 py-1 text-sm font-bold ${typeColors[adSlot.type] || 'bg-gray-100'}`}
            >
              {adSlot.type}
            </span>
          </div>
          {adSlot.publisher && (
            <div className="text-sm text-gray-600 mb-4">
              by <span className="font-medium text-black">{adSlot.publisher.name}</span>
              {adSlot.publisher.website && (
                <>
                  {' · '}
                  <a
                    href={adSlot.publisher.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {adSlot.publisher.website}
                  </a>
                </>
              )}
            </div>
          )}
          {adSlot.description && (
            <p className="text-gray-600 leading-relaxed">{adSlot.description}</p>
          )}
        </div>

        {/* Audience & Reach */}
        <div>
          <h2 className="text-xl font-bold mb-4">Audience & Reach</h2>
          <div className="space-y-4">
            <div className="bg-[#F7F8F9] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-[#DADEFD] flex items-center justify-center text-[#4057FE]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{adSlot.publisher?.monthlyViews?.toLocaleString() || 'N/A'}</p>
                <p className="text-sm text-gray-500">Monthly Views</p>
              </div>
            </div>

            <div className="bg-[#F7F8F9] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-[#DADEFD] flex items-center justify-center text-[#4057FE]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{adSlot.publisher?.subscriberCount?.toLocaleString() || 'N/A'}</p>
                <p className="text-sm text-gray-500">Subscribers</p>
              </div>
            </div>

            <div className="bg-[#F7F8F9] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-[#DADEFD] flex items-center justify-center text-[#4057FE]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{adSlot.publisher?.category || 'General'}</p>
                <p className="text-sm text-gray-500">Category</p>
              </div>
            </div>
          </div>
        </div>

        {/* Placement Details */}
        <div>
          <h2 className="text-xl font-bold mb-4">Placement Details</h2>
          <div className="space-y-4">
            <div className="bg-[#F7F8F9] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-[#DADEFD] flex items-center justify-center text-[#4057FE]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">
                  {adSlot.position
                    ? adSlot.position.charAt(0).toUpperCase() +
                      adSlot.position.slice(1).toLowerCase()
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">Position</p>
              </div>
            </div>

            <div className="bg-[#F7F8F9] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-[#DADEFD] flex items-center justify-center text-[#4057FE]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">
                  {adSlot.type.charAt(0).toUpperCase() + adSlot.type.slice(1).toLowerCase()}
                </p>
                <p className="text-sm text-gray-500">Ad Type</p>
              </div>
            </div>

            <div className="bg-[#F7F8F9] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-[#DADEFD] flex items-center justify-center text-[#4057FE]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">${Number(adSlot.basePrice).toLocaleString()}/month</p>
                <p className="text-sm text-gray-500">Flat Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Action Card */}
      <div>
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-24">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-3xl font-bold text-[#4057FE]">
                ${Number(adSlot.basePrice).toLocaleString()}
              </h3>
              <p className="text-gray-500 text-sm">per month</p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {adSlot.isAvailable ? (
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                  <span className="font-medium text-green-600 text-sm">Available</span>
                </>
              ) : (
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
                  <span className="font-medium text-gray-500 text-sm">Booked</span>
                </>
              )}
            </div>
          </div>

          {!bookingSuccess ? (
            <div className="space-y-3">
              {roleLoading ? (
                <button disabled className="w-full rounded-2xl bg-gray-100 py-3 font-bold text-gray-400">
                  Loading...
                </button>
              ) : roleInfo?.role === 'sponsor' && roleInfo?.sponsorId ? (
                <>
                  {!adSlot.isAvailable ? (
                    <button
                      onClick={handleUnbook}
                      className="w-full rounded-2xl bg-red-500 py-3 text-white font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <button
                      onClick={handleBooking}
                      disabled={booking}
                      className="w-full rounded-2xl bg-[#4057FE] py-3 text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed"
                    >
                      {booking ? 'Processing...' : 'Book Now'}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-gray-600 mb-2">
                    {user ? 'Only sponsors can request placements' : 'Log in as a sponsor to request'}
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full rounded-2xl bg-[#4057FE] py-3 text-white font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    Get Started Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 text-green-800 p-4 rounded-2xl text-center border border-green-100">
              <p className="font-bold text-lg mb-1">Request Sent!</p>
              <p className="text-sm">The publisher will review your request shortly.</p>
              <button
                onClick={handleUnbook}
                className="mt-4 text-xs text-green-600 underline hover:text-green-800"
              >
                Reset (for demo)
              </button>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>This is a request, not a binding purchase</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Publisher typically responds within 24h</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cancel anytime before your placement goes live</span>
            </div>
            {adSlot.publisher?.isVerified && (
              <div className="flex items-start gap-3 text-sm font-medium text-[#4057FE]">
                <svg className="w-5 h-5 text-[#4057FE] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Verified publisher</span>
              </div>
            )}
            
            {bookingError && <p className="text-sm text-red-600 mt-2">{bookingError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
