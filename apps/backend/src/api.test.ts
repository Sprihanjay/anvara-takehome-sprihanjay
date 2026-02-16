import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const mockGetSession = vi.fn();

vi.mock('./lib/auth.js', () => ({
  auth: { api: { getSession: (...args: unknown[]) => mockGetSession(...args) } },
}));

vi.mock('better-auth/node', () => ({
  fromNodeHeaders: (h: unknown) => h,
}));

const mockPrisma = {
  sponsor: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  publisher: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  campaign: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  adSlot: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  placement: {
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  $queryRaw: vi.fn(),
};

vi.mock('./db.js', () => ({
  prisma: mockPrisma,
  CampaignStatus: {
    DRAFT: 'DRAFT',
    PENDING_REVIEW: 'PENDING_REVIEW',
    APPROVED: 'APPROVED',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  AdSlotType: {
    DISPLAY: 'DISPLAY',
    VIDEO: 'VIDEO',
    NATIVE: 'NATIVE',
    NEWSLETTER: 'NEWSLETTER',
    PODCAST: 'PODCAST',
  },
}));

const { default: app } = await import('./index.js');


const SPONSOR_USER = {
  id: 'user-sponsor-1',
  email: 'sponsor@example.com',
};

const PUBLISHER_USER = {
  id: 'user-publisher-1',
  email: 'publisher@example.com',
};

const SPONSOR_ID = 'sponsor-1';
const PUBLISHER_ID = 'publisher-1';

function mockSponsorSession() {
  mockGetSession.mockResolvedValue({ user: SPONSOR_USER });
  mockPrisma.sponsor.findUnique.mockResolvedValue({ id: SPONSOR_ID });
  mockPrisma.publisher.findUnique.mockResolvedValue(null);
}

function mockPublisherSession() {
  mockGetSession.mockResolvedValue({ user: PUBLISHER_USER });
  mockPrisma.sponsor.findUnique.mockResolvedValue(null);
  mockPrisma.publisher.findUnique.mockResolvedValue({ id: PUBLISHER_ID });
}

function mockUnauthenticated() {
  mockGetSession.mockResolvedValue(null);
}

const VALID_CAMPAIGN_BODY = {
  name: 'Test Campaign',
  budget: 5000,
  startDate: '2026-03-01',
  endDate: '2026-04-01',
};

const VALID_AD_SLOT_BODY = {
  name: 'Sidebar Ad',
  type: 'DISPLAY',
  basePrice: 50,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================
// Health (public)
// ============================

describe('GET /api/health', () => {
  it('returns health status without authentication', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });
});

// ============================
// Auth routes
// ============================

describe('Auth routes', () => {
  describe('GET /api/auth/me', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('returns user context when authenticated as sponsor', async () => {
      mockSponsorSession();
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(SPONSOR_USER.id);
      expect(res.body.role).toBe('sponsor');
      expect(res.body.sponsorId).toBe(SPONSOR_ID);
    });
  });

  describe('GET /api/auth/role/:userId', () => {
    it('returns role without requiring authentication', async () => {
      mockPrisma.sponsor.findUnique.mockResolvedValue({ id: SPONSOR_ID, name: 'Test Sponsor' });

      const res = await request(app).get('/api/auth/role/some-user-id');

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('sponsor');
    });
  });
});

// ============================
// Campaign routes (protected)
// ============================

describe('Campaign routes', () => {
  describe('GET /api/campaigns', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).get('/api/campaigns');
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as publisher (not sponsor)', async () => {
      mockPublisherSession();
      const res = await request(app).get('/api/campaigns');
      expect(res.status).toBe(403);
    });

    it('returns only the sponsor\'s own campaigns', async () => {
      mockSponsorSession();
      const campaigns = [{ id: 'c1', name: 'My Campaign', sponsorId: SPONSOR_ID }];
      mockPrisma.campaign.findMany.mockResolvedValue(campaigns);

      const res = await request(app).get('/api/campaigns');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].sponsorId).toBe(SPONSOR_ID);

      const findManyCall = mockPrisma.campaign.findMany.mock.calls[0][0];
      expect(findManyCall.where.sponsorId).toBe(SPONSOR_ID);
    });
  });

  describe('GET /api/campaigns/:id', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).get('/api/campaigns/campaign-1');
      expect(res.status).toBe(401);
    });

    it('returns 404 for non-existent campaign (anti-enumeration)', async () => {
      mockSponsorSession();
      mockPrisma.campaign.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/campaigns/nonexistent-id');

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('returns 404 when accessing another sponsor\'s campaign (anti-enumeration)', async () => {
      mockSponsorSession();
      // findFirst with { id, sponsorId } returns null for wrong owner
      mockPrisma.campaign.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/campaigns/campaign-other');

      expect(res.status).toBe(404);
    });

    it('returns campaign when sponsor owns it', async () => {
      mockSponsorSession();
      const campaign = {
        id: 'campaign-1',
        name: 'My Campaign',
        sponsorId: SPONSOR_ID,
        sponsor: {},
        creatives: [],
        placements: [],
      };
      mockPrisma.campaign.findFirst.mockResolvedValue(campaign);

      const res = await request(app).get('/api/campaigns/campaign-1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('campaign-1');
    });
  });

  describe('POST /api/campaigns', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).post('/api/campaigns').send({ name: 'test' });
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as publisher', async () => {
      mockPublisherSession();
      const res = await request(app).post('/api/campaigns').send({ name: 'test' });
      expect(res.status).toBe(403);
    });

    it('returns 400 for missing required fields', async () => {
      mockSponsorSession();
      const res = await request(app).post('/api/campaigns').send({ budget: 100 });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('name');
    });

    it('returns 400 for name too short', async () => {
      mockSponsorSession();
      const res = await request(app).post('/api/campaigns').send({
        ...VALID_CAMPAIGN_BODY,
        name: 'ab',
      });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('name');
    });

    it('returns 400 for negative budget', async () => {
      mockSponsorSession();
      const res = await request(app).post('/api/campaigns').send({
        ...VALID_CAMPAIGN_BODY,
        budget: -100,
      });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('budget');
    });

    it('returns 400 when end date is before start date', async () => {
      mockSponsorSession();
      const res = await request(app).post('/api/campaigns').send({
        ...VALID_CAMPAIGN_BODY,
        startDate: '2026-04-01',
        endDate: '2026-03-01',
      });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('endDate');
    });

    it('creates campaign using session user\'s sponsorId', async () => {
      mockSponsorSession();
      const created = {
        id: 'new-campaign',
        name: 'Test Campaign',
        sponsorId: SPONSOR_ID,
        sponsor: { id: SPONSOR_ID, name: 'Test' },
      };
      mockPrisma.campaign.create.mockResolvedValue(created);

      const res = await request(app).post('/api/campaigns').send(VALID_CAMPAIGN_BODY);

      expect(res.status).toBe(201);
      expect(res.body.sponsorId).toBe(SPONSOR_ID);

      const createCall = mockPrisma.campaign.create.mock.calls[0][0];
      expect(createCall.data.sponsorId).toBe(SPONSOR_ID);
    });
  });

  describe('PUT /api/campaigns/:id', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).put('/api/campaigns/c1').send({ name: 'Updated' });
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as publisher', async () => {
      mockPublisherSession();
      const res = await request(app).put('/api/campaigns/c1').send({ name: 'Updated' });
      expect(res.status).toBe(403);
    });

    it('returns 400 for invalid input (name too short)', async () => {
      mockSponsorSession();
      const res = await request(app).put('/api/campaigns/c1').send({ name: 'ab' });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('name');
    });

    it('returns 400 for invalid status value', async () => {
      mockSponsorSession();
      const res = await request(app).put('/api/campaigns/c1').send({ status: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('status');
    });

    it('returns 404 when campaign not found or not owned', async () => {
      mockSponsorSession();
      mockPrisma.campaign.findFirst.mockResolvedValue(null);

      const res = await request(app).put('/api/campaigns/nonexistent').send({ name: 'Updated Name' });

      expect(res.status).toBe(404);
    });

    it('updates campaign successfully', async () => {
      mockSponsorSession();
      mockPrisma.campaign.findFirst.mockResolvedValue({ id: 'c1', sponsorId: SPONSOR_ID });
      const updated = {
        id: 'c1',
        name: 'Updated Campaign',
        sponsorId: SPONSOR_ID,
        status: 'ACTIVE',
      };
      mockPrisma.campaign.update.mockResolvedValue(updated);

      const res = await request(app).put('/api/campaigns/c1').send({
        name: 'Updated Campaign',
        status: 'ACTIVE',
      });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Campaign');
      expect(res.body.status).toBe('ACTIVE');
    });
  });

  describe('DELETE /api/campaigns/:id', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).delete('/api/campaigns/c1');
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as publisher', async () => {
      mockPublisherSession();
      const res = await request(app).delete('/api/campaigns/c1');
      expect(res.status).toBe(403);
    });

    it('returns 404 when campaign not found or not owned', async () => {
      mockSponsorSession();
      mockPrisma.campaign.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/campaigns/nonexistent');

      expect(res.status).toBe(404);
    });

    it('deletes campaign successfully and returns 204', async () => {
      mockSponsorSession();
      mockPrisma.campaign.findFirst.mockResolvedValue({ id: 'c1', sponsorId: SPONSOR_ID });
      mockPrisma.campaign.delete.mockResolvedValue({ id: 'c1' });

      const res = await request(app).delete('/api/campaigns/c1');

      expect(res.status).toBe(204);
      expect(mockPrisma.campaign.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });
  });
});

// ============================
// Ad Slot routes (mixed)
// ============================

describe('Ad Slot routes', () => {
  describe('GET /api/ad-slots (public)', () => {
    it('returns ad slots without authentication', async () => {
      mockPrisma.adSlot.findMany.mockResolvedValue([{ id: 'slot-1', name: 'Hero Banner' }]);

      const res = await request(app).get('/api/ad-slots');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/ad-slots/:id (public)', () => {
    it('returns a single ad slot without authentication', async () => {
      mockPrisma.adSlot.findUnique.mockResolvedValue({
        id: 'slot-1',
        name: 'Hero Banner',
        publisher: {},
        placements: [],
      });

      const res = await request(app).get('/api/ad-slots/slot-1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('slot-1');
    });

    it('returns 404 for non-existent ad slot', async () => {
      mockPrisma.adSlot.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/ad-slots/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/ad-slots (publisher only)', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).post('/api/ad-slots').send({ name: 'Slot' });
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as sponsor', async () => {
      mockSponsorSession();
      const res = await request(app).post('/api/ad-slots').send({ name: 'Slot' });
      expect(res.status).toBe(403);
    });

    it('returns 400 for missing required fields', async () => {
      mockPublisherSession();
      const res = await request(app).post('/api/ad-slots').send({ name: 'Slot' });
      expect(res.status).toBe(400);
      expect(res.body.field).toBeDefined();
    });

    it('returns 400 for name too short', async () => {
      mockPublisherSession();
      const res = await request(app).post('/api/ad-slots').send({
        ...VALID_AD_SLOT_BODY,
        name: 'ab',
      });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('name');
    });

    it('returns 400 for invalid type enum', async () => {
      mockPublisherSession();
      const res = await request(app).post('/api/ad-slots').send({
        ...VALID_AD_SLOT_BODY,
        type: 'INVALID_TYPE',
      });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('type');
    });

    it('returns 400 for non-positive basePrice', async () => {
      mockPublisherSession();
      const res = await request(app).post('/api/ad-slots').send({
        ...VALID_AD_SLOT_BODY,
        basePrice: 0,
      });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('basePrice');
    });

    it('creates ad slot using session user\'s publisherId', async () => {
      mockPublisherSession();
      const created = {
        id: 'new-slot',
        name: 'Sidebar Ad',
        publisherId: PUBLISHER_ID,
        publisher: { id: PUBLISHER_ID, name: 'Test' },
      };
      mockPrisma.adSlot.create.mockResolvedValue(created);

      const res = await request(app).post('/api/ad-slots').send(VALID_AD_SLOT_BODY);

      expect(res.status).toBe(201);
      expect(res.body.publisherId).toBe(PUBLISHER_ID);

      const createCall = mockPrisma.adSlot.create.mock.calls[0][0];
      expect(createCall.data.publisherId).toBe(PUBLISHER_ID);
    });
  });

  describe('PUT /api/ad-slots/:id (publisher only)', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).put('/api/ad-slots/slot-1').send({ name: 'Updated' });
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as sponsor', async () => {
      mockSponsorSession();
      const res = await request(app).put('/api/ad-slots/slot-1').send({ name: 'Updated' });
      expect(res.status).toBe(403);
    });

    it('returns 400 for invalid input (name too short)', async () => {
      mockPublisherSession();
      const res = await request(app).put('/api/ad-slots/slot-1').send({ name: 'ab' });
      expect(res.status).toBe(400);
      expect(res.body.field).toBe('name');
    });

    it('returns 404 when ad slot not found or not owned', async () => {
      mockPublisherSession();
      mockPrisma.adSlot.findFirst.mockResolvedValue(null);

      const res = await request(app).put('/api/ad-slots/nonexistent').send({ name: 'Updated Slot' });

      expect(res.status).toBe(404);
    });

    it('updates ad slot successfully', async () => {
      mockPublisherSession();
      mockPrisma.adSlot.findFirst.mockResolvedValue({ id: 'slot-1', publisherId: PUBLISHER_ID });
      const updated = {
        id: 'slot-1',
        name: 'Updated Slot',
        basePrice: 75,
        publisherId: PUBLISHER_ID,
      };
      mockPrisma.adSlot.update.mockResolvedValue(updated);

      const res = await request(app).put('/api/ad-slots/slot-1').send({
        name: 'Updated Slot',
        basePrice: 75,
      });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Slot');
      expect(res.body.basePrice).toBe(75);
    });
  });

  describe('DELETE /api/ad-slots/:id (publisher only)', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).delete('/api/ad-slots/slot-1');
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as sponsor', async () => {
      mockSponsorSession();
      const res = await request(app).delete('/api/ad-slots/slot-1');
      expect(res.status).toBe(403);
    });

    it('returns 404 when ad slot not found or not owned', async () => {
      mockPublisherSession();
      mockPrisma.adSlot.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/ad-slots/nonexistent');

      expect(res.status).toBe(404);
    });

    it('deletes ad slot successfully and returns 204', async () => {
      mockPublisherSession();
      mockPrisma.adSlot.findFirst.mockResolvedValue({ id: 'slot-1', publisherId: PUBLISHER_ID });
      mockPrisma.adSlot.delete.mockResolvedValue({ id: 'slot-1' });

      const res = await request(app).delete('/api/ad-slots/slot-1');

      expect(res.status).toBe(204);
      expect(mockPrisma.adSlot.delete).toHaveBeenCalledWith({ where: { id: 'slot-1' } });
    });
  });

  describe('POST /api/ad-slots/:id/book (sponsor only)', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).post('/api/ad-slots/slot-1/book').send({});
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as publisher', async () => {
      mockPublisherSession();
      const res = await request(app).post('/api/ad-slots/slot-1/book').send({});
      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent ad slot', async () => {
      mockSponsorSession();
      mockPrisma.adSlot.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/api/ad-slots/nonexistent/book').send({});

      expect(res.status).toBe(404);
    });

    it('books an available ad slot for the authenticated sponsor', async () => {
      mockSponsorSession();
      mockPrisma.adSlot.findUnique.mockResolvedValue({
        id: 'slot-1',
        isAvailable: true,
        publisher: {},
      });
      mockPrisma.adSlot.update.mockResolvedValue({
        id: 'slot-1',
        isAvailable: false,
        publisher: { id: PUBLISHER_ID, name: 'Test' },
      });

      const res = await request(app).post('/api/ad-slots/slot-1/book').send({
        message: 'Interested in this slot',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/ad-slots/:id/unbook (auth required)', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).post('/api/ad-slots/slot-1/unbook');
      expect(res.status).toBe(401);
    });

    it('unbooks ad slot when authenticated', async () => {
      mockSponsorSession();
      mockPrisma.adSlot.update.mockResolvedValue({
        id: 'slot-1',
        isAvailable: true,
        publisher: { id: PUBLISHER_ID, name: 'Test' },
      });

      const res = await request(app).post('/api/ad-slots/slot-1/unbook');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

// ============================
// Sponsor routes (protected)
// ============================

describe('Sponsor routes', () => {
  describe('GET /api/sponsors', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).get('/api/sponsors');
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as publisher', async () => {
      mockPublisherSession();
      const res = await request(app).get('/api/sponsors');
      expect(res.status).toBe(403);
    });

    it('scopes data to the authenticated sponsor', async () => {
      mockSponsorSession();
      mockPrisma.sponsor.findMany.mockResolvedValue([{ id: SPONSOR_ID }]);

      const res = await request(app).get('/api/sponsors');

      expect(res.status).toBe(200);
      const findManyCall = mockPrisma.sponsor.findMany.mock.calls[0][0];
      expect(findManyCall.where.id).toBe(SPONSOR_ID);
    });
  });

  describe('GET /api/sponsors/:id', () => {
    it('returns 403 when accessing another sponsor', async () => {
      mockSponsorSession();
      const res = await request(app).get('/api/sponsors/other-sponsor-id');
      expect(res.status).toBe(403);
    });
  });
});

// ============================
// Publisher routes (protected)
// ============================

describe('Publisher routes', () => {
  describe('GET /api/publishers', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).get('/api/publishers');
      expect(res.status).toBe(401);
    });

    it('returns 403 when authenticated as sponsor', async () => {
      mockSponsorSession();
      const res = await request(app).get('/api/publishers');
      expect(res.status).toBe(403);
    });

    it('scopes data to the authenticated publisher', async () => {
      mockPublisherSession();
      mockPrisma.publisher.findMany.mockResolvedValue([{ id: PUBLISHER_ID }]);

      const res = await request(app).get('/api/publishers');

      expect(res.status).toBe(200);
      const findManyCall = mockPrisma.publisher.findMany.mock.calls[0][0];
      expect(findManyCall.where.id).toBe(PUBLISHER_ID);
    });
  });

  describe('GET /api/publishers/:id', () => {
    it('returns 403 when accessing another publisher', async () => {
      mockPublisherSession();
      const res = await request(app).get('/api/publishers/other-publisher-id');
      expect(res.status).toBe(403);
    });
  });
});

// ============================
// Placement routes (protected)
// ============================

describe('Placement routes', () => {
  describe('GET /api/placements', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).get('/api/placements');
      expect(res.status).toBe(401);
    });

    it('scopes placements to sponsor\'s campaigns', async () => {
      mockSponsorSession();
      mockPrisma.placement.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/placements');

      expect(res.status).toBe(200);
      const findManyCall = mockPrisma.placement.findMany.mock.calls[0][0];
      expect(findManyCall.where.campaign?.sponsorId).toBe(SPONSOR_ID);
    });

    it('scopes placements to publisher', async () => {
      mockPublisherSession();
      mockPrisma.placement.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/placements');

      expect(res.status).toBe(200);
      const findManyCall = mockPrisma.placement.findMany.mock.calls[0][0];
      expect(findManyCall.where.publisherId).toBe(PUBLISHER_ID);
    });
  });

  describe('POST /api/placements', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).post('/api/placements').send({});
      expect(res.status).toBe(401);
    });

    it('returns 403 when campaign is not owned by user', async () => {
      mockSponsorSession();
      mockPrisma.campaign.findUnique.mockResolvedValue({
        id: 'other-campaign',
        sponsorId: 'other-sponsor-id',
      });

      const res = await request(app).post('/api/placements').send({
        campaignId: 'other-campaign',
        creativeId: 'creative-1',
        adSlotId: 'slot-1',
        publisherId: PUBLISHER_ID,
        agreedPrice: 100,
        startDate: '2026-03-01',
        endDate: '2026-04-01',
      });

      expect(res.status).toBe(403);
    });
  });
});

// ============================
// Dashboard routes (protected)
// ============================

describe('Dashboard routes', () => {
  describe('GET /api/dashboard/stats', () => {
    it('returns 401 when unauthenticated', async () => {
      mockUnauthenticated();
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.status).toBe(401);
    });

    it('returns stats when authenticated', async () => {
      mockSponsorSession();
      mockPrisma.sponsor.count.mockResolvedValue(5);
      mockPrisma.publisher.count.mockResolvedValue(3);
      mockPrisma.campaign.count.mockResolvedValue(10);
      mockPrisma.placement.count.mockResolvedValue(20);
      mockPrisma.placement.aggregate.mockResolvedValue({
        _sum: { impressions: 1000, clicks: 50, conversions: 5 },
      });

      const res = await request(app).get('/api/dashboard/stats');

      expect(res.status).toBe(200);
      expect(res.body.sponsors).toBe(5);
      expect(res.body.metrics.totalImpressions).toBe(1000);
    });
  });
});
