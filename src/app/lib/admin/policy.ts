export const MEANINGFUL_EVENTS = [
  'TASK_CREATED', 'TASK_COMPLETED', 'TASK_UPDATED', 'TASK_DELETED',
  'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED',
  'HABIT_CREATED', 'HABIT_UPDATED', 'HABIT_COMPLETED', 'HABIT_UNCOMPLETED', 'HABIT_DELETED',
  'COLLABORATOR_INVITED', 'PROJECT_JOINED',
] as const;

export type ActivityType = typeof MEANINGFUL_EVENTS[number] | 'USER_LOGIN';
export function isAdminRole(role: unknown): role is 'ADMIN' { return role === 'ADMIN'; }

export function parseUserFilters(params: URLSearchParams) {
  const page = Number(params.get('page') || 1);
  return {
    search: (params.get('q') || '').trim().slice(0, 160),
    role: ['ADMIN', 'USER'].includes(params.get('role') || '') ? params.get('role')! : '',
    activity: ['active', 'inactive'].includes(params.get('activity') || '') ? params.get('activity')! : '',
    sort: ['oldest', 'activity'].includes(params.get('sort') || '') ? params.get('sort')! : 'newest',
    // Billing is not installed: unknown is the only honest subscription filter.
    subscription: params.get('subscription') === 'unavailable' ? 'unavailable' : '',
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100000) : 1,
    limit: 20,
  };
}

export const BILLING_UNAVAILABLE = 'Unavailable — belum ada tabel subscription/payment atau integrasi pembayaran yang tervalidasi.';
