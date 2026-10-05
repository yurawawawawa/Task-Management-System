import 'server-only';
import { execute, sql } from './sql';
import type { ActivityType } from './policy';

// Only bounded, developer-defined codes are stored. Never log request bodies,
// email addresses, URL queries, raw errors, cookies, tokens, or metadata.
export async function recordActivity(userId: string, event: ActivityType, entity: string, entityId?: string) {
  if (process.env.TREKLY_ADMIN_TELEMETRY_ENABLED !== 'true') return;
  try {
    await execute(sql`INSERT INTO trekly_admin.activity_events (user_id, event_type, entity_type, entity_id)
      VALUES (${userId}::uuid, ${event}, ${entity}, NULLIF(${entityId || ''}, '')::uuid)`);
  } catch {
    console.warn('Trekly activity telemetry unavailable');
  }
}

export type OperationEvent = {
  category: 'API' | 'ERROR' | 'AUTH' | 'SECURITY';
  operation: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED';
  status?: number;
  durationMs?: number;
  userId?: string;
  code?: string;
};

export async function recordOperation(event: OperationEvent) {
  if (process.env.TREKLY_ADMIN_TELEMETRY_ENABLED !== 'true') return;
  try {
    await execute(sql`INSERT INTO trekly_admin.operation_events
      (category, operation, outcome, status_code, duration_ms, user_id, code)
      VALUES (${event.category}, ${event.operation.slice(0, 120)}, ${event.outcome},
        NULLIF(${event.status === undefined ? '' : String(event.status)}, '')::integer,
        NULLIF(${event.durationMs === undefined ? '' : String(event.durationMs)}, '')::integer,
        NULLIF(${event.userId || ''}, '')::uuid, NULLIF(${event.code?.slice(0, 80) || ''}, ''))`);
  } catch {
    console.warn('Trekly operation telemetry unavailable');
  }
}

export async function recordAudit(actorId: string, action: string, targetId?: string, outcome: 'SUCCESS' | 'DENIED' = 'SUCCESS') {
  // Privileged reads fail closed if their audit entry cannot be persisted.
  await execute(sql`INSERT INTO trekly_admin.audit_logs (actor_id, action, target_id, outcome)
    VALUES (${actorId}::uuid, ${action}, NULLIF(${targetId || ''}, '')::uuid, ${outcome})`);
}

export function withApiTelemetry<Args extends unknown[]>(operation: string, handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    const started = performance.now();
    try {
      const response = await handler(...args);
      await recordOperation({ category: 'API', operation, status: response.status,
        outcome: response.status >= 400 ? 'FAILURE' : 'SUCCESS', durationMs: Math.round(performance.now() - started) });
      if (operation.startsWith('auth.')) {
        await recordOperation({ category: 'AUTH', operation, status: response.status,
          outcome: response.status >= 400 ? 'FAILURE' : 'SUCCESS' });
      }
      if (response.status === 401 || response.status === 403) {
        await recordOperation({ category: 'SECURITY', operation, status: response.status, outcome: 'DENIED', code: 'ACCESS_DENIED' });
      }
      return response;
    } catch (error) {
      await recordOperation({ category: 'API', operation, outcome: 'FAILURE', status: 500,
        durationMs: Math.round(performance.now() - started), code: 'UNHANDLED_API_ERROR' });
      throw error;
    }
  };
}
