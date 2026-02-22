export type UserRole = 'sponsor' | 'publisher';

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export type AdSlotType = 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'NEWSLETTER' | 'PODCAST';

export type PlacementStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  budget: number;
  spent: number;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  sponsorId: string;
  sponsor?: { id: string; name: string; logo?: string };
  _count?: { creatives: number; placements: number };
}

export interface AdSlot {
  id: string;
  name: string;
  description?: string;
  type: AdSlotType;
  basePrice: number;
  isAvailable: boolean;
  publisherId: string;
  publisher?: { id: string; name: string; category?: string; monthlyViews?: number; subscriberCount?: number; isVerified?: boolean };
  _count?: { placements: number };
}

export interface Placement {
  id: string;
  impressions: number;
  clicks: number;
  status: PlacementStatus;
  campaignId: string;
  adSlotId: string;
}

export interface DashboardStats {
  sponsors: number;
  publishers: number;
  activeCampaigns: number;
  totalPlacements: number;
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCtr: string | number;
  };
}
