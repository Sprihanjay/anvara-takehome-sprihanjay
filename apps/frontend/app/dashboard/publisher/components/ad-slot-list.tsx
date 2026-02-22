'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LayoutGrid, CheckCircle, DollarSign, Search, Plus } from 'lucide-react';
import { deleteAdSlot } from '@/lib/api';
import type { AdSlot } from '@/lib/types';
import { AdSlotCard } from './ad-slot-card';
import PlusImg from '../../../assets/images/plusimg.svg';

interface AdSlotListProps {
  initialAdSlots: AdSlot[];
}

export function AdSlotList({ initialAdSlots }: AdSlotListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adSlots, setAdSlots] = useState(initialAdSlots);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'BOOKED'>('ALL');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ad slot?')) return;

    startTransition(async () => {
      try {
        await deleteAdSlot(id);
        const newSlots = adSlots.filter((slot) => slot.id !== id);
        setAdSlots(newSlots);
        router.refresh();
      } catch {
        // console.error('Failed to delete ad slot:', error);
        alert('Failed to delete ad slot');
      }
    });
  };

  const filteredSlots = adSlots.filter((slot) => {
    const matchesSearch = slot.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'AVAILABLE'
        ? slot.isAvailable
        : !slot.isAvailable;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      title: 'Total Slots',
      value: adSlots.length,
      icon: LayoutGrid,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Available',
      value: adSlots.filter((s) => s.isAvailable).length,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Price',
      value:
        adSlots.length > 0
          ? `$${Math.round(
              adSlots.reduce((acc, s) => acc + Number(s.basePrice), 0)
            ).toLocaleString()}`
          : '$0',
      icon: DollarSign,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ad Slots</h1>
          <p className="text-gray-600">Manage your advertising inventory and pricing</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/publisher/new')}
          className="flex items-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4057FE]"
        >
          <Image src={PlusImg} alt="Add" width={15} height={15} />
          Create Ad Slot
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`rounded-2xl p-3 ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 rounded-full border border-gray-100 bg-white p-1 shadow-sm">
          {(['ALL', 'AVAILABLE', 'BOOKED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-[#4057FE] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search slots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-[#4057FE] focus:ring-2 focus:ring-[#4057FE]/20 sm:w-64"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredSlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <LayoutGrid className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No ad slots found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchQuery
              ? `No slots matching "${searchQuery}"`
              : "You haven't created any ad slots yet."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push('/dashboard/publisher/new')}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4057FE]"
            >
              <Plus className="h-4 w-4" />
              Create your first slot
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSlots.map((slot) => (
            <AdSlotCard
              key={slot.id}
              adSlot={slot}
              onEdit={() => router.push(`/dashboard/publisher/${slot.id}`)}
              onDelete={() => handleDelete(slot.id)}
              isDeleting={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

