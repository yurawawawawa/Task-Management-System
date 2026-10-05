import { describe, expect, it } from 'vitest';
import { isAdminRole, parseUserFilters, MEANINGFUL_EVENTS } from './policy';
import { registerSchema } from '../validations/auth';

describe('admin policy', () => {
  it('accepts only the exact persisted ADMIN role', () => {
    expect(isAdminRole('ADMIN')).toBe(true);
    for (const role of ['USER', 'admin', true, undefined, { role: 'ADMIN' }]) expect(isAdminRole(role)).toBe(false);
  });
  it('never accepts signup role elevation', () => {
    const data = registerSchema.parse({ name: 'Example User', email: 'test@example.test', password: 'StrongPassword123!', role: 'ADMIN' });
    expect(data).not.toHaveProperty('role');
  });
  it('bounds filters and pagination without accepting arbitrary SQL sort fields', () => {
    const f = parseUserFilters(new URLSearchParams({q:'x'.repeat(1000),page:'-2',role:'admin',sort:'created_at; DROP TABLE profiles',limit:'9999'}));
    expect(f).toMatchObject({page:1,role:'',sort:'newest',limit:20});
    expect(f.search).toHaveLength(160);
    expect(parseUserFilters(new URLSearchParams('page=999999999')).page).toBe(100000);
    expect(parseUserFilters(new URLSearchParams('page=NaN')).page).toBe(1);
  });
  it('excludes authentication and billing from active-user activity', () => {
    expect(MEANINGFUL_EVENTS).not.toContain('USER_LOGIN');
    expect(MEANINGFUL_EVENTS).not.toContain('PAYMENT_SUCCESS');
    expect(MEANINGFUL_EVENTS).toContain('TASK_COMPLETED');
  });
});
