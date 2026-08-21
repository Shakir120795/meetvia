import { describe, expect, it, vi } from 'vitest';
import { requireRole } from './requireRole';

vi.mock('../lib/prisma', () => ({
  prisma: {
    userRoleAssignment: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '../lib/prisma';

describe('requireRole', () => {
  it('returns 401 when authentication is missing', async () => {
    const req = { user: undefined } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    await requireRole('ADMIN')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when the user lacks the required role', async () => {
    vi.mocked(prisma.userRoleAssignment.findMany).mockResolvedValue([]);
    const req = { user: { userId: 'user-1' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    await requireRole('ADMIN')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when the user has an allowed role', async () => {
    vi.mocked(prisma.userRoleAssignment.findMany).mockResolvedValue([{ role: 'ADMIN' }] as any);
    const req = { user: { userId: 'admin-1' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    await requireRole('ADMIN')(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
