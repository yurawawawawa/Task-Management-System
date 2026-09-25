import { NextResponse, type NextRequest } from 'next/server';
import { getAuthUser, createClient } from '@/app/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    const supabase = await createClient();
    const currentFreeze =
      typeof user.user_metadata?.freezeCount === 'number'
        ? user.user_metadata.freezeCount
        : 2;

    let newCount = currentFreeze;
    if (action === 'use') {
      newCount = Math.max(0, currentFreeze - 1);
    } else if (action === 'cancel') {
      newCount = Math.min(3, currentFreeze + 1);
    }

    await supabase.auth.updateUser({
      data: {
        freezeCount: newCount,
      },
    });

    return NextResponse.json({
      success: true,
      freezeCount: newCount,
    });
  } catch (error) {
    console.error('Failed to update freeze count', error);
    return NextResponse.json(
      { error: 'Failed to update freeze count' },
      { status: 500 }
    );
  }
}
