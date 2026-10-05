import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ user: vi.fn(), read: vi.fn(), operation: vi.fn(), redirect: vi.fn() }));
vi.mock('@/app/lib/supabase/server', () => ({ getAuthUser: mock.user }));
vi.mock('./sql', () => ({ sql: (parts: TemplateStringsArray, ...values: unknown[]) => ({parts,values}), readJson: mock.read }));
vi.mock('./telemetry', () => ({ recordOperation: mock.operation }));
vi.mock('next/navigation', () => ({ redirect: mock.redirect }));
import { requireAdmin, requireAdminPage } from './auth';

beforeEach(() => vi.resetAllMocks());
describe('server-side admin guard', () => {
  it('rejects an anonymous session before querying profiles', async () => {
    mock.user.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toMatchObject({status:401});
    expect(mock.read).not.toHaveBeenCalled();
  });
  it('ignores forged ADMIN user metadata and logs denied USER access', async () => {
    mock.user.mockResolvedValue({id:'user',user_metadata:{role:'ADMIN'}});
    mock.read.mockResolvedValue({id:'user',role:'USER'});
    await expect(requireAdmin()).rejects.toMatchObject({status:403});
    expect(mock.operation).toHaveBeenCalledWith(expect.objectContaining({category:'SECURITY',outcome:'DENIED'}));
  });
  it('rejects a missing profile and fails closed on a DB outage', async () => {
    mock.user.mockResolvedValue({id:'user'});
    mock.read.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toMatchObject({status:403});
    mock.read.mockRejectedValue(new Error('offline'));
    await expect(requireAdmin()).rejects.toThrow('offline');
  });
  it('rechecks the current DB role after revocation; does not cache authorization', async () => {
    mock.user.mockResolvedValue({id:'user'});
    mock.read.mockResolvedValueOnce({id:'user',role:'ADMIN'}).mockResolvedValueOnce({id:'user',role:'USER'});
    await expect(requireAdmin()).resolves.toMatchObject({role:'ADMIN'});
    await expect(requireAdmin()).rejects.toMatchObject({status:403});
    expect(mock.read).toHaveBeenCalledTimes(2);
  });
  it('redirects non-admin pages to the regular dashboard', async () => {
    mock.user.mockResolvedValue({id:'user'});
    mock.read.mockResolvedValue({id:'user',role:'USER'});
    mock.redirect.mockImplementation(() => { throw new Error('redirect'); });
    await expect(requireAdminPage()).rejects.toThrow('redirect');
    expect(mock.redirect).toHaveBeenCalledWith('/dashboard');
  });
});
