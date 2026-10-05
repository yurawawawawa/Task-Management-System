import 'server-only';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/app/lib/supabase/server';
import { readJson, sql } from './sql';
import { isAdminRole } from './policy';
import { recordOperation } from './telemetry';

export class AdminAccessError extends Error {
  constructor(public readonly status: 401 | 403) { super(status === 401 ? 'Unauthorized' : 'Forbidden'); }
}

export async function requireAdmin() {
  const user = await getAuthUser(); // Supabase verifies the session server-side.
  if (!user) throw new AdminAccessError(401);
  // Read the current DB role on every request. Never trust user_metadata/JWT role.
  const profile = await readJson<{ id: string; name: string; email: string; role: string } | null>(sql`
    SELECT coalesce((SELECT json_build_object('id', id, 'name', name, 'email', email, 'role', role)
      FROM public.profiles WHERE id = ${user.id}::uuid), 'null'::json)::text AS payload`);
  if (!profile || !isAdminRole(profile.role)) {
    await recordOperation({ category: 'SECURITY', operation: 'admin.access', outcome: 'DENIED', status: 403, userId: user.id });
    throw new AdminAccessError(403);
  }
  return profile;
}

export async function requireAdminPage() {
  try { return await requireAdmin(); }
  catch (error) {
    if (error instanceof AdminAccessError) redirect(error.status === 401 ? '/login?next=/admin' : '/dashboard');
    throw error;
  }
}
