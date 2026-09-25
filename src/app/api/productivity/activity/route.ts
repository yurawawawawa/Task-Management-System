import { NextResponse, type NextRequest } from 'next/server';
import { getAuthUser, createClient } from '@/app/lib/supabase/server';
import { recordDailyActivity, getUserProductivityStats } from '@/app/lib/activity';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getUserProductivityStats(user.id);
    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error('Failed to get productivity stats', error);
    return NextResponse.json(
      { error: 'Failed to fetch productivity stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { date, type, action } = body;

    const result = await recordDailyActivity(user.id, {
      date,
      type,
      action: action === 'decrement' ? 'decrement' : 'increment',
    });

    const stats = await getUserProductivityStats(user.id);

    return NextResponse.json({
      success: true,
      result,
      ...stats,
    });
  } catch (error) {
    console.error('Failed to record daily activity', error);
    return NextResponse.json(
      { error: 'Failed to record activity' },
      { status: 500 }
    );
  }
}
