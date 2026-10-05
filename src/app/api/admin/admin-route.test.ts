import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ guard: vi.fn(), data: vi.fn() }));
vi.mock('@/app/lib/admin/auth', () => ({
  requireAdmin: mock.guard,
  AdminAccessError: class extends Error { constructor(public status: number) { super(status === 401 ? 'Unauthorized' : 'Forbidden'); } },
}));
vi.mock('@/app/lib/admin/data', () => ({getOverview:mock.data,getUsers:mock.data,getUserDetail:mock.data,getHealth:mock.data,getBilling:mock.data,getLogs:mock.data}));
vi.mock('@/app/lib/admin/telemetry', () => ({withApiTelemetry: (_:string, fn:unknown) => fn}));
import { GET } from './[...path]/route';
import { AdminAccessError } from '@/app/lib/admin/auth';
beforeEach(() => vi.resetAllMocks());
describe('admin API', () => {
  it.each([401,403] as const)('returns %s and no sensitive data on every API section', async status => {
    mock.guard.mockRejectedValue(new AdminAccessError(status));
    for (const path of [['overview'],['users'],['users','00000000-0000-4000-8000-000000000001'],['health'],['security'],['audit'],['unexpected']]) {
      const response = await GET(new Request('http://localhost/api/admin/'+path.join('/')), {params:Promise.resolve({path})});
      expect(response.status).toBe(status);
      expect(response.headers.get('cache-control')).toContain('no-store');
      expect(await response.json()).toEqual({error:status === 401 ? 'Unauthorized' : 'Forbidden'});
    }
    expect(mock.data).not.toHaveBeenCalled();
  });
  it('does not expose raw DB errors', async () => {
    mock.data.mockRejectedValue(new Error('postgres://secret:password@database'));
    const response = await GET(new Request('http://localhost/api/admin/overview'),{params:Promise.resolve({path:['overview']})});
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('password');
  });
  it('returns data only after verification and prevents caching', async () => {
    mock.data.mockResolvedValue({users:{total:4}});
    const response = await GET(new Request('http://localhost/api/admin/overview'),{params:Promise.resolve({path:['overview']})});
    expect(response.status).toBe(200);
    expect(mock.guard).toHaveBeenCalled();
    expect(await response.json()).toEqual({users:{total:4}});
    expect(response.headers.get('vary')).toBe('Cookie');
  });
});
