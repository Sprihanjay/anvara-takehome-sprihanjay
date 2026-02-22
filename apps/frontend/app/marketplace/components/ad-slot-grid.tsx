'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getAdSlots } from '@/lib/api';
import type { AdSlot } from '@/lib/types';
import { CustomSelect } from './custom-select';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

type TypeFilter = 'all' | 'DISPLAY' | 'VIDEO' | 'NEWSLETTER' | 'PODCAST';
type StatusFilter = 'all' | 'available' | 'booked';
type SortOption = 'default' | 'price-low' | 'price-high' | 'views-high' | 'views-low';

export function AdSlotGrid() {
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  useEffect(() => {
    getAdSlots()
      .then(setAdSlots)
      .catch(() => setError('Failed to load ad slots'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-[--color-muted]">Loading marketplace...</div>;
  }

  if (error) {
    return <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>;
  }

  // Apply filters and search
  let filteredSlots = adSlots;

  // Type filter
  if (typeFilter !== 'all') {
    filteredSlots = filteredSlots.filter(slot => slot.type === typeFilter);
  }

  // Status filter
  if (statusFilter === 'available') {
    filteredSlots = filteredSlots.filter(slot => slot.isAvailable);
  } else if (statusFilter === 'booked') {
    filteredSlots = filteredSlots.filter(slot => !slot.isAvailable);
  }

  // Search filter
  if (searchQuery) {
    filteredSlots = filteredSlots.filter(slot =>
      slot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.publisher?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  filteredSlots = [...filteredSlots].sort((a, b) => {
    switch (sortOption) {
      case 'default':
        return 0; // Keep original order
      case 'price-low':
        return Number(a.basePrice) - Number(b.basePrice);
      case 'price-high':
        return Number(b.basePrice) - Number(a.basePrice);
      case 'views-high':
        return (b.publisher?.monthlyViews || 0) - (a.publisher?.monthlyViews || 0);
      case 'views-low':
        return (a.publisher?.monthlyViews || 0) - (b.publisher?.monthlyViews || 0);
      default:
        return 0;
    }
  });

  const activeFilterCount = [
    typeFilter !== 'all',
    statusFilter !== 'all',
    sortOption !== 'default',
  ].filter(Boolean).length;

  if (adSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-12 text-center text-[--color-muted]">
        No ad slots available at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search placements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-[#F7F8F9] py-3 pl-12 pr-4 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <CustomSelect
             value={typeFilter}
             onChange={(val) => setTypeFilter(val as TypeFilter)}
             options={[
               { value: 'all', label: 'All Types' },
               { value: 'DISPLAY', label: 'Display' },
               { value: 'VIDEO', label: 'Video' },
               { value: 'NEWSLETTER', label: 'Newsletter' },
               { value: 'PODCAST', label: 'Podcast' },
             ]}
             placeholder="Select Type"
           />

           <CustomSelect
             value={statusFilter}
             onChange={(val) => setStatusFilter(val as StatusFilter)}
             options={[
               { value: 'all', label: 'All Status' },
               { value: 'available', label: 'Available' },
               { value: 'booked', label: 'Booked' },
             ]}
             placeholder="Select Status"
           />

           <CustomSelect
             value={sortOption}
             onChange={(val) => setSortOption(val as SortOption)}
             options={[
               { value: 'default', label: 'Default Order' },
               { value: 'price-low', label: 'Price: Low to High' },
               { value: 'price-high', label: 'Price: High to Low' },
               { value: 'views-high', label: 'Views: High to Low' },
               { value: 'views-low', label: 'Views: Low to High' },
             ]}
             placeholder="Sort By"
           />

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setSortOption('default');
              }}
              className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Clear Filters
              <span className="ml-1 rounded-full bg-[#DADEFD] px-2 py-0.5 text-xs text-[#4057FE] font-semibold">{activeFilterCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredSlots.length} of {adSlots.length} placements
      </div>

      {/* Grid */}
      {filteredSlots.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg font-semibold text-gray-900">No placements found</p>
          <p className="mt-2 text-sm text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSlots.map((slot) => (
        <Link
          key={slot.id}
          href={`/marketplace/${slot.id}`}
          className="bg-white text-black rounded-4xl border shadow-xl p-6 gap-4 border-gray-50"
        >
          <div className="mb-0.5 flex items-start justify-between">
            <div className="flex items-center">
              <h3 className="font-semibold">{slot.name}</h3>
              {slot.publisher?.isVerified && (
                <svg
                  className="ml-2"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4057fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              )}
            </div>
            <span
              className={`rounded-xl font-semibold px-3 py-0.5 text-xs ${typeColors[slot.type] || 'bg-gray-100'}`}
            >
              {slot.type}
            </span>
          </div>

          {slot.publisher && (
            <div className="mb-2">
              <p className="text-xs text-[--color-muted]">by {slot.publisher.name}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                {slot.publisher.monthlyViews && (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#767e8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    {slot.publisher.monthlyViews.toLocaleString()} views/mo
                  </span>
                )}
                {slot.publisher.subscriberCount && (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#767e8d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    {slot.publisher.subscriberCount.toLocaleString()} subs
                  </span>
                )}
              </div>
            </div>
          )}

          {slot.description && (
            <p className="mb-5 text-sm text-[--color-muted] line-clamp-2">{slot.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span
              className={
                slot.isAvailable
                  ? 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200'
                  : 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-gray-200'
              }
            >
              {slot.isAvailable ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle cx="8" cy="8" r="6" fill="currentColor" fillOpacity="0.2" />
                  <circle cx="8" cy="8" r="3" fill="currentColor" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <rect
                    x="4"
                    y="4"
                    width="8"
                    height="8"
                    rx="1"
                    fill="currentColor"
                    fillOpacity="0.3"
                  />
                  <rect x="6" y="6" width="4" height="4" fill="currentColor" />
                </svg>
              )}
              {slot.isAvailable ? 'Available' : 'Booked'}
            </span>
            <span className="font-semibold text-[--color-primary]">
              ${Number(slot.basePrice).toLocaleString()}/mo
            </span>
          </div>
        </Link>
      ))}
        </div>
      )}
    </div>
  );
}
