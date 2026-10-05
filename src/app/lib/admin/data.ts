import 'server-only';
import { requireAdmin } from './auth';
import { recordAudit } from './telemetry';
import { parseUserFilters, BILLING_UNAVAILABLE, MEANINGFUL_EVENTS } from './policy';
import { readJson, sql } from './sql';
const meaningfulTypes = `{${MEANINGFUL_EVENTS.join(',')}}`;

export interface Overview {
  generatedAt: string;
  trackingEnabled: boolean;
  trackingStartedAt: string;
  users: { total: number; today: number; week: number; month: number };
  active: { now: number; dau: number; wau: number; mau: number };
  product: { projects: number; tasks: number; completed: number; habits: number; activeProjects: number };
  operations: { failedRequests: number; serverFailures: number; errors: number; authFailures: number; securityEvents: number; requests: number };
  growth: { day: string; signups: number; active: number }[];
  activity: ActivityRow[];
}
export interface ActivityRow { id: string; user_id: string; name: string; event_type: string; entity_type: string; created_at: string }
export interface AdminUser {
  id: string; name: string; email: string; role: string; created_at: string; last_active: string | null;
  projects: number; tasks: number; completed_tasks: number;
}
export interface UserList { users: AdminUser[]; total: number; page: number; limit: number }
export interface UserDetail { user: AdminUser | null; activity: ActivityRow[] }
export interface LogRow { id: string; category: string; operation: string; outcome: string; status_code: number | null; code: string | null; user_id: string | null; target_id: string | null; duration_ms: number | null; created_at: string }
export interface Logs { rows: LogRow[]; total: number; page: number; limit: number }

async function authorizeRead(action: string, targetId?: string) {
  const admin = await requireAdmin();
  await recordAudit(admin.id, action, targetId);
  return admin;
}

export async function getOverview(): Promise<Overview> {
  await authorizeRead('VIEW_OVERVIEW');
  return readJson<Overview>(sql`
    WITH bounds AS (SELECT date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS today,
      date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS week,
      date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS month),
    active AS (SELECT user_id, created_at FROM trekly_admin.activity_events
      WHERE event_type = ANY(${meaningfulTypes}::text[]) AND created_at >= now() - interval '30 days'),
    daily_users AS (SELECT (created_at AT TIME ZONE 'UTC')::date AS day, count(*) AS count
      FROM public.profiles WHERE created_at >= (SELECT today FROM bounds) - interval '29 days' GROUP BY 1),
    daily_active AS (SELECT (created_at AT TIME ZONE 'UTC')::date AS day, count(DISTINCT user_id) AS count FROM active GROUP BY 1),
    days AS (SELECT generate_series((SELECT today FROM bounds) - interval '29 days', (SELECT today FROM bounds), interval '1 day') AS day)
    SELECT json_build_object(
      'generatedAt', now(), 'trackingEnabled', ${process.env.TREKLY_ADMIN_TELEMETRY_ENABLED === 'true'}::boolean,
      'trackingStartedAt', (SELECT started_at FROM trekly_admin.tracking_config),
      'users', (SELECT json_build_object('total', count(*), 'today', count(*) FILTER (WHERE created_at >= bounds.today),
        'week', count(*) FILTER (WHERE created_at >= bounds.week), 'month', count(*) FILTER (WHERE created_at >= bounds.month)) FROM public.profiles CROSS JOIN bounds),
      'active', (SELECT json_build_object('now', count(DISTINCT user_id) FILTER (WHERE created_at >= now() - interval '5 minutes'),
        'dau', count(DISTINCT user_id) FILTER (WHERE created_at >= now() - interval '24 hours'),
        'wau', count(DISTINCT user_id) FILTER (WHERE created_at >= now() - interval '7 days'), 'mau', count(DISTINCT user_id)) FROM active),
      'product', json_build_object('projects', (SELECT count(*) FROM public.projects), 'tasks', (SELECT count(*) FROM public.tasks),
        'completed', (SELECT count(*) FROM public.tasks WHERE status = 'DONE'), 'habits', (SELECT count(*) FROM public.habits),
        'activeProjects', (SELECT count(*) FROM public.projects p WHERE EXISTS (SELECT 1 FROM public.tasks t WHERE t.project_id = p.id AND t.status IN ('TODO', 'IN_PROGRESS')))),
      'operations', (SELECT json_build_object('failedRequests', count(*) FILTER (WHERE category = 'API' AND status_code >= 400),
        'serverFailures', count(*) FILTER (WHERE category = 'API' AND status_code >= 500),
        'errors', count(*) FILTER (WHERE category = 'ERROR'), 'authFailures', count(*) FILTER (WHERE category = 'AUTH' AND outcome = 'FAILURE'),
        'securityEvents', count(*) FILTER (WHERE category = 'SECURITY'), 'requests', count(*) FILTER (WHERE category = 'API'))
        FROM trekly_admin.operation_events WHERE created_at >= now() - interval '24 hours'),
      'growth', (SELECT json_agg(json_build_object('day', to_char(days.day AT TIME ZONE 'UTC', 'YYYY-MM-DD'),
        'signups', coalesce(u.count, 0), 'active', coalesce(a.count, 0)) ORDER BY days.day)
        FROM days LEFT JOIN daily_users u ON u.day = (days.day AT TIME ZONE 'UTC')::date
        LEFT JOIN daily_active a ON a.day = (days.day AT TIME ZONE 'UTC')::date),
      'activity', (SELECT coalesce(json_agg(row_to_json(r)), '[]'::json) FROM (
        SELECT e.id, e.user_id, p.name, e.event_type, e.entity_type, e.created_at FROM trekly_admin.activity_events e
        JOIN public.profiles p ON p.id = e.user_id ORDER BY e.created_at DESC LIMIT 12) r)
    )::text AS payload`);
}

export async function getUsers(params: URLSearchParams): Promise<UserList> {
  await authorizeRead('VIEW_USERS');
  const f = parseUserFilters(params);
  const pattern = `%${f.search.replace(/[\\%_]/g, '\\$&')}%`;
  return readJson<UserList>(sql`
    WITH matches AS (
      SELECT p.id, p.name, p.email, p.role, p.created_at, a.last_active FROM public.profiles p
      LEFT JOIN LATERAL (SELECT max(created_at) AS last_active FROM trekly_admin.activity_events e
        WHERE e.user_id = p.id AND e.event_type = ANY(${meaningfulTypes}::text[])) a ON true
      WHERE (${f.search} = '' OR p.name ILIKE ${pattern} OR p.email ILIKE ${pattern})
        AND (${f.role} = '' OR p.role = ${f.role})
        AND (${f.activity} = '' OR (${f.activity} = 'active' AND a.last_active >= now() - interval '30 days')
          OR (${f.activity} = 'inactive' AND (a.last_active IS NULL OR a.last_active < now() - interval '30 days')))
    ), paged AS (
      SELECT * FROM matches ORDER BY
        CASE WHEN ${f.sort} = 'activity' THEN last_active END DESC NULLS LAST,
        CASE WHEN ${f.sort} = 'oldest' THEN created_at END ASC,
        CASE WHEN ${f.sort} <> 'oldest' THEN created_at END DESC, id
      LIMIT ${f.limit} OFFSET ${(f.page - 1) * f.limit}
    ) SELECT json_build_object('total', (SELECT count(*) FROM matches), 'page', ${f.page}::integer, 'limit', ${f.limit}::integer,
      'users', (SELECT coalesce(json_agg(row_to_json(r)), '[]'::json) FROM (
        SELECT paged.*, (SELECT count(*) FROM public.projects WHERE user_id = paged.id) AS projects,
          (SELECT count(*) FROM public.tasks WHERE user_id = paged.id) AS tasks,
          (SELECT count(*) FROM public.tasks WHERE user_id = paged.id AND status = 'DONE') AS completed_tasks FROM paged) r)
    )::text AS payload`);
}

export async function getUserDetail(id: string): Promise<UserDetail> {
  await authorizeRead('VIEW_USER_DETAIL', id);
  return readJson<UserDetail>(sql`
    SELECT json_build_object('user', (SELECT row_to_json(r) FROM (
      SELECT p.id, p.name, p.email, p.role, p.created_at,
        (SELECT max(created_at) FROM trekly_admin.activity_events WHERE user_id = p.id AND event_type = ANY(${meaningfulTypes}::text[])) AS last_active,
        (SELECT count(*) FROM public.projects WHERE user_id = p.id) AS projects,
        (SELECT count(*) FROM public.tasks WHERE user_id = p.id) AS tasks,
        (SELECT count(*) FROM public.tasks WHERE user_id = p.id AND status = 'DONE') AS completed_tasks
      FROM public.profiles p WHERE p.id = ${id}::uuid) r),
      'activity', (SELECT coalesce(json_agg(row_to_json(r)), '[]'::json) FROM (
        SELECT e.id, e.user_id, p.name, e.event_type, e.entity_type, e.created_at FROM trekly_admin.activity_events e
        JOIN public.profiles p ON p.id = e.user_id WHERE e.user_id = ${id}::uuid ORDER BY e.created_at DESC LIMIT 50) r)
    )::text AS payload`);
}

export async function getLogs(kind: 'operations' | 'errors' | 'security' | 'audit', page = 1): Promise<Logs> {
  await authorizeRead(`VIEW_${kind.toUpperCase()}`);
  const currentPage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100000) : 1;
  const offset = (currentPage - 1) * 30;
  if (kind === 'audit') {
    return readJson<Logs>(sql`SELECT json_build_object('total', (SELECT count(*) FROM trekly_admin.audit_logs),
      'page', ${currentPage}::integer, 'limit', 30, 'rows', (SELECT coalesce(json_agg(row_to_json(r)), '[]'::json) FROM (
        SELECT id, 'AUDIT' AS category, action AS operation, outcome, NULL AS status_code, NULL AS code,
          actor_id AS user_id, target_id, NULL AS duration_ms, created_at FROM trekly_admin.audit_logs ORDER BY created_at DESC, id LIMIT 30 OFFSET ${offset}) r))::text AS payload`);
  }
  return readJson<Logs>(sql`
    WITH matches AS (SELECT id, category, operation, outcome, status_code, code, user_id, NULL AS target_id, duration_ms, created_at
      FROM trekly_admin.operation_events WHERE
        (${kind} = 'operations') OR (${kind} = 'errors' AND (category = 'ERROR' OR status_code >= 500))
        OR (${kind} = 'security' AND (category = 'SECURITY' OR category = 'AUTH')))
    SELECT json_build_object('total', (SELECT count(*) FROM matches), 'page', ${currentPage}::integer, 'limit', 30,
      'rows', (SELECT coalesce(json_agg(row_to_json(r)), '[]'::json) FROM (
        SELECT * FROM matches ORDER BY created_at DESC, id LIMIT 30 OFFSET ${offset}) r))::text AS payload`);
}

export async function getHealth() {
  await authorizeRead('VIEW_HEALTH');
  const start = performance.now();
  const observation = await readJson<{ checkedAt: string; api: string | null; auth: string | null; failures: number }>(sql`
    SELECT json_build_object('checkedAt', now(),
      'api', (SELECT max(created_at) FROM trekly_admin.operation_events WHERE category = 'API' AND outcome = 'SUCCESS'),
      'auth', (SELECT max(created_at) FROM trekly_admin.operation_events WHERE category = 'AUTH' AND outcome = 'SUCCESS'),
      'failures', (SELECT count(*) FROM trekly_admin.operation_events WHERE category = 'API' AND status_code >= 500 AND created_at >= now() - interval '15 minutes'))::text AS payload`);
  return { ...observation, database: 'reachable', databaseLatencyMs: Math.round(performance.now() - start),
    session: 'verified', coverage: 'Observed requests only; bukan uptime monitor eksternal.' };
}

export async function getBilling() {
  await authorizeRead('VIEW_BILLING');
  return { available: false as const, reason: BILLING_UNAVAILABLE,
    requirements: ['Subscription lifecycle dan plan per user', 'Payment ledger, currency, amount, paid_at, refund', 'Webhook terverifikasi, idempotency, dan delivery status'],
    metrics: ['Free Users', 'Paid Users', 'Active Subscriptions', 'Trial Users', 'Expired Subscriptions', 'Cancelled Subscriptions',
      'Revenue Today', 'Revenue This Month', 'Revenue Previous Month', 'MRR', 'Successful Payments', 'Failed Payments', 'Webhook Failures'] };
}
