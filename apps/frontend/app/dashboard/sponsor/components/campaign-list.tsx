'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { deleteCampaign } from '../actions';
import { CampaignForm } from './campaign-form';
import { CampaignCard } from './campaign-card';
import type { Campaign } from '@/lib/types';
import PlusImg from "../../../assets/images/plusimg.svg";

interface CampaignListProps {
  campaigns: Campaign[];
}

type FilterTab = 'all' | 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'PENDING_REVIEW' | 'COMPLETED';

export function CampaignList({ campaigns }: CampaignListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    startTransition(async () => {
      const result = await deleteCampaign(id);
      if (result.error) {
        alert(result.error);
      }
    });
  }

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED').length;

  // Filter campaigns
  let filteredCampaigns = campaigns;
  
  if (activeFilter !== 'all') {
    filteredCampaigns = filteredCampaigns.filter(c => c.status === activeFilter);
  }

  if (searchQuery) {
    filteredCampaigns = filteredCampaigns.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div>
      {/* Header with title and create button */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns Management</h1>
          <p className="mt-1 text-gray-600">Manage your campaigns and monitor performance</p>
        </div>
        <Link
          href="/dashboard/sponsor/new"
          className="flex items-center gap-2 font-semibold rounded-2xl bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-[#4057FE]"
        >
          <Image src={PlusImg} alt="Create Campaign" width={15} height={15} className="block" />
          <span>New campaign</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="mt-3 text-3xl font-bold text-black">{totalCampaigns}</p>
              <p className="mt-1 text-xs text-gray-500">All campaigns created</p>
            </div>
            <div className="flex items-center justify-center p-3 bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target h-6 w-6 text-blue-600" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="mt-3 text-3xl font-bold text-black">{activeCampaigns}</p>
              <p className="mt-1 text-xs text-gray-500">{totalCampaigns > 0 ? Math.round((activeCampaigns / totalCampaigns) * 100) : 0}% of total campaigns</p>
            </div>
            <div className="flex items-center justify-center p-3 bg-emerald-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity h-6 w-6 text-emerald-600" aria-hidden="true"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Campaigns</p>
              <p className="mt-3 text-3xl font-bold text-black">{completedCampaigns}</p>
              <p className="mt-1 text-xs text-gray-500">{totalCampaigns > 0 ? Math.round((completedCampaigns / totalCampaigns) * 100) : 0}% are completed</p>
            </div>
            <div className="flex items-center justify-center p-3 bg-purple-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check h-6 w-6 text-purple-600" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'DRAFT', 'ACTIVE', 'PAUSED', 'PENDING_REVIEW', 'COMPLETED'] as const).map((tab) => {
            const displayLabel = tab === 'all' ? 'All' : tab === 'PENDING_REVIEW' ? 'Pending Approval' : tab.charAt(0) + tab.slice(1).toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab as FilterTab)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeFilter === tab
                    ? 'bg-[#4057FE] text-white'
                    : 'border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="rounded-lg p-12 text-center">
          <p className="text-2xl font-bold text-black">No campaigns found</p>
          <p className="mt-2 text-gray-600">No campaigns match your search criteria.</p>
          <p className="mt-2 text-sm text-gray-500">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id}>
              {editingId === campaign.id ? (
                <div className="bg-white text-black rounded-4xl border shadow-xl p-6 gap-4 border-gray-50">
                  <h3 className="mb-4 text-lg font-semibold">Edit Campaign</h3>
                  <CampaignForm 
                    campaign={campaign} 
                    onCancel={() => setEditingId(null)} 
                  />
                </div>
              ) : (
                <CampaignCard
                  campaign={campaign}
                  onEdit={() => setEditingId(campaign.id)}
                  onDelete={() => handleDelete(campaign.id)}
                  isDeleting={isPending}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
