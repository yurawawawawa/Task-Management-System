import { withApiTelemetry } from '@/app/lib/admin/telemetry';
import { NextResponse } from 'next/server';
import { requireAdmin, AdminAccessError } from '@/app/lib/admin/auth';
import { getOverview, getUsers, getUserDetail, getLogs, getHealth, getBilling } from '@/app/lib/admin/data';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie' };

async function handleGET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    await requireAdmin();
    const { path } = await params;
    const search = new URL(request.url).searchParams;
    let data;
    if (path.length === 1 && path[0] === 'overview') data = await getOverview();
    else if (path.length === 1 && path[0] === 'users') data = await getUsers(search);
    else if (path.length === 2 && path[0] === 'users' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(path[1])) {
      data = await getUserDetail(path[1]);
      if (!data.user) return NextResponse.json({error:'Not found'}, {status:404, headers});
    } else if (path.length === 1 && path[0] === 'health') data = await getHealth();
    else if (path.length === 1 && ['subscriptions','revenue'].includes(path[0])) data = await getBilling();
    else if (path.length === 1 && ['operations','errors','security','audit'].includes(path[0])) data = await getLogs(path[0] as 'operations' | 'errors' | 'security' | 'audit', Number(search.get('page') || 1));
    else return NextResponse.json({error:'Not found'}, {status:404, headers});
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof AdminAccessError) return NextResponse.json({error:error.message}, {status:error.status, headers});
    return NextResponse.json({error:'Admin data unavailable'}, {status:503, headers});
  }
}

export const GET = withApiTelemetry('admin.[...path].GET', handleGET);
