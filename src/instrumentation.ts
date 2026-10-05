import type { Instrumentation } from 'next';

export const onRequestError: Instrumentation.onRequestError = async (_error, _request, context) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.TREKLY_ADMIN_TELEMETRY_ENABLED !== 'true') return;
  try {
    const { recordOperation } = await import('./app/lib/admin/telemetry');
    await recordOperation({ category: 'ERROR', operation: context.routePath, outcome: 'FAILURE',
      code: `UNHANDLED_${context.routeType.toUpperCase()}` });
  } catch {
    console.warn('Trekly error telemetry unavailable');
  }
};
