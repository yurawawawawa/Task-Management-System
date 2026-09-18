import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';

export async function GET() {
  try {
    // 1. Dapatkan user dari cookie session
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ambil data Profile dari Prisma
    const profile = await db.orm.public.Profile
      .where({ id: authUser.id })
      .first();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({ user: profile });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
